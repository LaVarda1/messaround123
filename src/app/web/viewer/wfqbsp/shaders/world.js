"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vertex = `#version 100

uniform vec3 uOrigin;
uniform mat3 uAngles;
uniform vec3 uViewOrigin;
uniform mat3 uViewAngles;
uniform mat4 uPerspective;

attribute vec3 Vert;
attribute vec2 TexCoords;
attribute vec2 LMCoords;

varying float FogFragCoord;
varying vec2 vTexCoords;
varying vec2 vLMCoords;

void main()
{
  vec3 position = uViewAngles * (uAngles * Vert + uOrigin - uViewOrigin);
	gl_Position = uPerspective * vec4(position.xz, -position.y, 1.0);
	
	vTexCoords = TexCoords;
	vLMCoords = LMCoords;
	FogFragCoord = gl_Position.w;
}`;
exports.fragment = `#version 100
precision mediump float;

uniform sampler2D Tex;
uniform sampler2D LMTex;
uniform sampler2D FullbrightTex;
uniform bool uUseFullbrightTex;
uniform bool uUseOverbright;
uniform bool uUseAlphaTest;
uniform float uAlpha;
uniform float uFogDensity;
uniform vec4 uFogColor;

varying float FogFragCoord;
varying vec2 vTexCoords;
varying vec2 vLMCoords;

void main()
{
	vec4 result = texture2D(Tex, vTexCoords);
	if (uUseAlphaTest && (result.a < 0.666))
		discard;
	result *= texture2D(LMTex, vLMCoords);
	if (uUseOverbright)
		result.rgb *= 2.0;
	if (uUseFullbrightTex)
		result += texture2D(FullbrightTex, vTexCoords);
	result = clamp(result, 0.0, 1.0);
	float fog = exp(-uFogDensity * uFogDensity * FogFragCoord * FogFragCoord);
	fog = clamp(fog, 0.0, 1.0);
	result = mix(uFogColor, result, fog);
	result.a = uAlpha; // FIXME: This will make almost transparent things cut holes though heavy fog
	gl_FragColor = result;
}`;
//# sourceMappingURL=world.js.map