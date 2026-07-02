export const auroraVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const auroraFragmentShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_mouseVelocity;
uniform float u_scroll;
uniform vec2 u_resolution;

uniform sampler2D u_texture;
uniform vec3 u_overlayColorA;
uniform vec3 u_overlayColorB;
uniform float u_displacement;
uniform float u_speed;
uniform int u_blendMode; // 0 = none, 1 = multiply, 2 = screen, 3 = overlay

varying vec2 vUv;

// Hash function for random values
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Value Noise function
float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Cubic Hermite Interpolation (smoothstep curve)
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), 
    u.y
  );
}

// 5-Octave Fractional Brownian Motion (fBm)
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  // Rotate each octave to reduce directional artifacts
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    p = rot * p * 2.0 + vec2(100.0);
    amplitude *= 0.5;
  }
  return value;
}

// Mathematical Blend Modes

// Multiply Blend: base * blend
vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}

// Screen Blend: 1.0 - (1.0 - base) * (1.0 - blend)
vec3 blendScreen(vec3 base, vec3 blend) {
  return 1.0 - (1.0 - base) * (1.0 - blend);
}

// Helper for Overlay Blend on a single channel
float blendOverlayChannel(float base, float blend) {
  return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

// Overlay Blend: combines multiply (dark areas) and screen (light areas)
vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(
    blendOverlayChannel(base.r, blend.r),
    blendOverlayChannel(base.g, blend.g),
    blendOverlayChannel(base.b, blend.b)
  );
}

void main() {
  // Fix aspect ratio for isotropic noise
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;
  
  // Modulate time by speed setting
  float t = u_time * u_speed * 0.15;
  
  // Interactive coordinates warp (Domain Warping)
  // Combine scroll offset and normalized mouse positions
  vec2 scrollOffset = vec2(0.0, u_scroll * 0.4);
  vec2 mouseOffset = u_mouse * 0.1;
  
  // 1. Initial coordinates warp
  vec2 q = vec2(0.0);
  q.x = fbm(st + t + scrollOffset + mouseOffset);
  q.y = fbm(st + vec2(1.0) - scrollOffset + mouseOffset);
  
  // 2. Secondary domain warp incorporating mouse velocity to ripple the flow
  vec2 r = vec2(0.0);
  float velIntensity = length(u_mouseVelocity);
  vec2 velWarp = u_mouseVelocity * 0.05 * sin(length(st - u_mouse) * 8.0 - u_time * 4.0);
  
  r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + t * 0.8 + velWarp);
  r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + t * 0.6 + velWarp);
  
  // 3. Final noise evaluation
  float f = fbm(st + r);
  
  // Define displacement vector based on the noise structure
  vec2 displacement = r - 0.5;
  
  // Distort the UV coordinates of the texture using our fluid noise displacement
  vec2 distortedUv = vUv + displacement * u_displacement;
  // Sample texture with distorted UVs
  vec4 textureColor = texture2D(u_texture, distortedUv);
  
  // Generate gradient overlay color from color A and B based on vertical UV + warp
  vec3 overlayColor = mix(u_overlayColorA, u_overlayColorB, vUv.y + displacement.x * 0.2);
  
  // Mix in a bit of the raw noise highlights directly
  overlayColor = mix(overlayColor, vec3(1.0), f * 0.15);
  
  // Perform composition based on configuration uniform
  vec3 finalColor = textureColor.rgb;
  
  if (u_blendMode == 1) {
    // Multiply
    finalColor = blendMultiply(textureColor.rgb, overlayColor);
  } else if (u_blendMode == 2) {
    // Screen
    finalColor = blendScreen(textureColor.rgb, overlayColor);
  } else if (u_blendMode == 3) {
    // Overlay
    finalColor = blendOverlay(textureColor.rgb, overlayColor);
  }
  
  // Output color with standard texture alpha to support transparency
  gl_FragColor = vec4(finalColor, textureColor.a);
}
`;
