"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vertex = `uniform mat3 uViewAngles;
uniform mat4 uPerspective;
uniform vec3 uScale;
attribute vec3 aPosition;
varying vec2 vTexCoord;
void main(void)
{
  vec3 position = uViewAngles * (aPosition * uScale * 18918.0);
  gl_Position = uPerspective * vec4(position.xz, -position.y, 1.0);
  vTexCoord = aPosition.xy * uScale.xy * 1.5;
}`;
exports.fragment = `precision mediump float;
uniform float uGamma;
uniform vec2 uTime;
uniform sampler2D tSolid;
uniform sampler2D tAlpha;
varying vec2 vTexCoord;
void main(void)
{
  vec4 alpha = texture2D(tAlpha, vTexCoord + uTime.x);
  gl_FragColor = vec4(mix(texture2D(tSolid, vTexCoord + uTime.y).rgb, alpha.rgb, alpha.a), 1.0);
  gl_FragColor.r = pow(gl_FragColor.r, uGamma);
  gl_FragColor.g = pow(gl_FragColor.g, uGamma);
  gl_FragColor.b = pow(gl_FragColor.b, uGamma);
}`;
//# sourceMappingURL=sky.js.map