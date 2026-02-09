// Using global fetch

async function testPost() {
    const payload = {
        date: '2026-02-09',
        meal_type: 'breakfast',
        name: 'Test Food',
        brand: 'Test Brand',
        serving_size: 100,
        calories: 350,
        proteins: 10,
        carbs: 50,
        fats: 5
    };

    try {
        const response = await fetch('http://localhost:3001/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testPost();
