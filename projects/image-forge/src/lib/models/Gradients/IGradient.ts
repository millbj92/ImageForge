export interface IGradient {
  getGradient(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): CanvasGradient;
}
