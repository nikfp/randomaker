import z from 'zod';

export const inputSchema = z.object({
	input: z.string().trim().min(1, 'Input Too Short').max(255, 'Input Too Long')
});


