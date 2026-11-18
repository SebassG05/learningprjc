import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { limpiarCodigo, mensajeVerificacion, pideNuevoCodigo } from './verifyEmail.js';

describe('limpiarCodigo', () => {
  it('se queda con las cifras, como mucho 6', () => {
    assert.equal(limpiarCodigo('123 456'), '123456');
    assert.equal(limpiarCodigo('Código: 0123456789'), '012345');
    assert.equal(limpiarCodigo(undefined), '');
  });
});

describe('mensajeVerificacion', () => {
  it('código incorrecto con los intentos que quedan', () => {
    assert.equal(mensajeVerificacion(400, { code: 'wrong', restantes: 3 }), 'El código no es correcto. Te quedan 3 intentos.');
    assert.equal(mensajeVerificacion(400, { code: 'wrong', restantes: 1 }), 'El código no es correcto. Te queda 1 intento.');
  });
  it('caducado, demasiados intentos y límite por IP', () => {
    assert.match(mensajeVerificacion(400, { code: 'expired' }), /caducado/);
    assert.match(mensajeVerificacion(400, { code: 'too-many' }), /Pide uno nuevo/);
    assert.equal(mensajeVerificacion(429, { error: 'Espera' }), 'Espera');
  });
  it('sin código conocido usa el texto del servidor', () => {
    assert.equal(mensajeVerificacion(400, { error: 'Email inválido' }), 'Email inválido');
    assert.equal(mensajeVerificacion(500), 'No se ha podido comprobar el código.');
  });
});

describe('pideNuevoCodigo', () => {
  it('solo cuando el código ya no sirve', () => {
    assert.equal(pideNuevoCodigo({ code: 'expired' }), true);
    assert.equal(pideNuevoCodigo({ code: 'too-many' }), true);
    assert.equal(pideNuevoCodigo({ code: 'wrong' }), false);
  });
});
