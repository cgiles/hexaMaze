uniform u_color
void main() {
	gl_FragColor = vec4(u_color.x,u_color.y,u_color.z,1.0);
}