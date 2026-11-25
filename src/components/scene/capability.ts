import type { FallbackReason } from "./store";

export type SceneCapability = { ok: true } | { ok: false; reason: FallbackReason };

export const DESKTOP_SCENE_QUERY = "(min-width: 48rem)";

/**
 * Decides whether to load the WebGL world. `?scene=3d` forces it and
 * `?scene=fallback` forces the SVG illustration (useful for QA).
 */
export function detectSceneCapability(): SceneCapability {
  const forced = new URLSearchParams(window.location.search).get("scene");
  if (forced === "fallback") return { ok: false, reason: "forced" };
  const force3d = forced === "3d";

  if (!force3d && !window.matchMedia(DESKTOP_SCENE_QUERY).matches) return { ok: false, reason: "small-screen" };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  } catch {
    gl = null;
  }
  if (!gl) return { ok: false, reason: "unsupported" };

  try {
    if (!force3d) {
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      if (nav.connection?.saveData) return { ok: false, reason: "low-power" };
      if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return { ok: false, reason: "low-power" };
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return { ok: false, reason: "low-power" };
    }
  } finally {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return { ok: true };
}
