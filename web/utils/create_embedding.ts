export async function createEmbedding(body) {
    const embedding = await fetch('http://0.0.0.0:5001/api/embedding', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'default-api-route-secret' },
    });
    const response = await embedding.json()
    return response
}
