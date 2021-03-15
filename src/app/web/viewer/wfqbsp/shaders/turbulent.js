"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vertex = `uniform vec3 uOrigin;
uniform mat3 uAngles;
uniform vec3 uViewOrigin;
uniform mat3 uViewAngles;
uniform mat4 uPerspective;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;
void main(void)
{
  vec3 position = uViewAngles * (uAngles * aPosition + uOrigin - uViewOrigin);
  gl_Position = uPerspective * vec4(position.xz, -position.y, 1.0);
  vTexCoord = aTexCoord;
}`;
exports.fragment = `precision mediump float;
uniform float uGamma;
uniform float uTime;
uniform sampler2D tTexture;
uniform float uAlpha;

varying vec2 vTexCoord;
void main(void)
{
  gl_FragColor = vec4(texture2D(tTexture, vTexCoord + vec2(sin(vTexCoord.t * 3.141593 + uTime), sin(vTexCoord.s * 3.141593 + uTime)) * 0.125).rgb, 1.0);
  gl_FragColor.r = pow(gl_FragColor.r, uGamma);
  gl_FragColor.g = pow(gl_FragColor.g, uGamma);
  gl_FragColor.b = pow(gl_FragColor.b, uGamma);
  gl_FragColor.a = uAlpha;
}`;
//# sourceMappingURL=turbulent.js.map