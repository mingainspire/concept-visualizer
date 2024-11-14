import { json, type ActionArgs } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';

export const loader = () => json({});

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const concept = formData.get('concept');

  if (!concept || typeof concept !== 'string') {
    return json({ error: 'Concept is required' }, { status: 400 });
  }

  // For now, just return the concept - we'll add LLM processing later
  return json({ concept });
}

export default function Index() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Concept Visualizer</h1>
      
      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="concept" className="block text-sm font-medium mb-2">
            Enter your concept:
          </label>
          <textarea
            id="concept"
            name="concept"
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="Describe any concept you want to visualize..."
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Visualize
        </button>
      </Form>

      {actionData?.error && (
        <div className="mt-4 p-2 text-red-500 bg-red-100 rounded">
          {actionData.error}
        </div>
      )}

      {actionData?.concept && !actionData.error && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="font-bold mb-2">Submitted Concept:</h2>
          <p>{actionData.concept}</p>
        </div>
      )}
    </div>
  );
}
