const { z } = require('zod');

const createSnippet = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(255),
        code: z.string().min(1, 'Code is required'),
        description: z.string().optional(),
        language: z.string().min(1, 'Language is required').max(50),
        tags: z.array(z.string()).optional(),
        collection_id: z.number().int().positive().optional().nullable(),
    }),
});

const updateSnippet = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(255),
        code: z.string().min(1, 'Code is required'),
        description: z.string().optional(),
        language: z.string().min(1, 'Language is required').max(50),
        tags: z.array(z.string()).optional(),
        collection_id: z.number().int().positive().optional().nullable(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be an integer')
    })
});

module.exports = {
    createSnippet,
    updateSnippet
};
