const { AnyZodObject, ZodError } = require('zod');

const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        return next(error);
    }
};

module.exports = validate;
