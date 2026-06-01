import z from 'zod';

export const inputSchema = z.object({
	input: z.string().trim().min(5, 'Input Too Short').max(255, 'Input Too Long')
});


