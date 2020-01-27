import { assert } from './assert';

type Flavour = WebGLRenderingContextBase['VERTEX_SHADER'] | WebGLRenderingContextBase['FRAGMENT_SHADER'];
type ShaderDescriptor = [string, Flavour];

export async function getProgram(gl: WebGLRenderingContext, name: string, descriptors: ShaderDescriptor[]): Promise<WebGLProgram> {
    const shaders = await Promise.all(descriptors.map((descriptor: ShaderDescriptor) => getShader(gl, ...descriptor)))

    const program = gl.createProgram();
    assert(program !== null, 'program is not WebGLProgram');

    for (const shader of shaders) {
        gl.attachShader(program, shader);
    }
    gl.linkProgram(program);

    console.groupCollapsed(`${name} attributes:`);
    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
        var attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        console.log(attribInfo.name, gl.getAttribLocation(program, attribInfo.name));
    }

    console.groupEnd();

    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    if (numUniforms) {
        console.groupCollapsed(`${name} uniforms:`);
        for (var ii = 0; ii < numUniforms; ++ii) {
            var uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            console.log(uniformInfo.name, gl.getAttribLocation(program, uniformInfo.name));
        }
        console.groupEnd();
    }

    // TODO: Add textures

    return program;
}

async function getShader(gl: WebGLRenderingContext, name: string, flavour: Flavour): Promise<WebGLShader> {
    const source = (await import(`../shaders/${name}`)).default;

    const shader = gl.createShader(flavour);
    assert(shader !== null, 'shader is not WebGLShader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader)

    console.groupCollapsed(name);
    console.log(source);
    console.log('shaderInfoLog:');
    console.log(gl.getShaderInfoLog(shader));
    console.groupEnd();

    return shader;
}