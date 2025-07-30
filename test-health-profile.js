// Test the health profile update functionality
// This script demonstrates what should happen when updating health profile

console.log('Health Profile Update Test');
console.log('=========================');

// Sample health data that should be sent to backend
const healthData = {
    weight: 70,
    height: 175,
    bloodGroup: 'A+',
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    diabetesStatus: 'No Diabetes',
    cholesterolLevel: 180,
    allergies: 'Peanuts',
    chronicConditions: 'None',
    medications: 'None',
    emergencyContact: 'John Doe',
    emergencyPhone: '+1234567890',
    dateOfBirth: '1990-01-01'
};

console.log('Sample health data to be saved:');
console.log(JSON.stringify(healthData, null, 2));

console.log('\nBackend route: PUT /api/users/health-profile');
console.log('Frontend function: usersAPI.updateHealthProfile(healthData)');
console.log('Context update: updateUser(response.user)');

console.log('\nIf the data is not persisting:');
console.log('1. Check backend User model has all fields');
console.log('2. Check backend route handles all fields');
console.log('3. Check frontend updates context properly');
console.log('4. Check localStorage/sessionStorage is updated');
