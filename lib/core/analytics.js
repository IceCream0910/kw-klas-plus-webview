export async function hashIdentifier(identifier) {
  if (!identifier) return null;

  try {
    const response = await fetch('/api/analytics/hash-identifier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier }),
    });

    if (!response.ok) {
      console.error('Failed to fetch hashed identifier');
      return null;
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('Error fetching hashed identifier:', error);
    return null;
  }
}

export async function identifyUser(hakbun) {
  if (!hakbun || !window.rybbit || !window.rybbit.identify) return;
  try {
    const hashedHakbun = await hashIdentifier(hakbun);
    if (hashedHakbun) {
      window.rybbit.identify(hashedHakbun);
    }
  } catch (e) {
    console.error("Failed to identify user", e);
  }
}
