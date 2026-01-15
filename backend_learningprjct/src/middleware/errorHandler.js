// Middleware para manejar rutas no encontradas
export function notFound(req, res, next) {
	res.status(404);
	res.json({ error: 'Ruta no encontrada' });
}

// Middleware para manejar errores generales
export function errorHandler(err, req, res, next) {
	const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
	res.status(statusCode);
	res.json({
		error: err.message || 'Error interno del servidor',
		stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
	});
}
