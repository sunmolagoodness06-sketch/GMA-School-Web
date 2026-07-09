import mongoose from 'mongoose';
import Student from '../models/Student.js';

// Sample students for testing registration
const sampleStudents = [
  {
    regNumber: 'GMA/PRI/2024/0001',
    fullName: 'Emmanuel Johnson',
    class: 'Grade 5',
    division: 'primary',
    session: '2024/2025',
    dateOfBirth: new Date('2013-03-15'),
    gender: 'male',
    parentInfo: {
      name: 'Mrs. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+234-701-234-5678',
      relationship: 'mother',
      address: '12 Victoria Street, Victoria Island, Lagos'
    },
    emergencyContact: {
      name: 'Mr. David Johnson',
      phone: '+234-802-345-6789',
      relationship: 'father'
    },
    academicInfo: {
      admissionDate: new Date('2019-09-01'),
      previousSchool: 'Little Angels Nursery',
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Art'],
      house: 'Blue House'
    },
    isActive: true
  },
  {
    regNumber: 'GMA/SEC/2024/0001',
    fullName: 'Adaeze Okonkwo',
    class: 'JSS 2',
    division: 'secondary',
    session: '2024/2025',
    dateOfBirth: new Date('2011-07-22'),
    gender: 'female',
    parentInfo: {
      name: 'Dr. Chukwuma Okonkwo',
      email: 'chukwuma.okonkwo@email.com',
      phone: '+234-803-456-7890',
      relationship: 'father',
      address: '45 Admiralty Way, Lekki Phase 1, Lagos'
    },
    emergencyContact: {
      name: 'Mrs. Ngozi Okonkwo',
      phone: '+234-704-567-8901',
      relationship: 'mother'
    },
    academicInfo: {
      admissionDate: new Date('2022-09-01'),
      previousSchool: 'International School Lagos',
      subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
      house: 'Red House'
    },
    isActive: true
  },
  {
    regNumber: 'GMA/NUR/2024/0001',
    fullName: 'Kemi Adebayo',
    class: 'Reception',
    division: 'nursery',
    session: '2024/2025',
    dateOfBirth: new Date('2019-11-10'),
    gender: 'female',
    parentInfo: {
      name: 'Mr. Tunde Adebayo',
      email: 'tunde.adebayo@email.com',
      phone: '+234-805-678-9012',
      relationship: 'father',
      address: '8 Banana Island Road, Ikoyi, Lagos'
    },
    emergencyContact: {
      name: 'Mrs. Funmi Adebayo',
      phone: '+234-706-789-0123',
      relationship: 'mother'
    },
    academicInfo: {
      admissionDate: new Date('2024-09-01'),
      previousSchool: null,
      subjects: ['Pre-Reading', 'Pre-Math', 'Creative Play', 'Music & Movement'],
      house: 'Yellow House'
    },
    isActive: true
  },
  {
    regNumber: 'GMA/COL/2024/0001',
    fullName: 'Michael Ibrahim',
    class: 'SS 3',
    division: 'college',
    session: '2024/2025',
    dateOfBirth: new Date('2006-12-05'),
    gender: 'male',
    parentInfo: {
      name: 'Alhaji Musa Ibrahim',
      email: 'musa.ibrahim@email.com',
      phone: '+234-807-890-1234',
      relationship: 'father',
      address: '22 Kofo Abayomi Street, Victoria Island, Lagos'
    },
    emergencyContact: {
      name: 'Hajiya Fatima Ibrahim',
      phone: '+234-708-901-2345',
      relationship: 'mother'
    },
    academicInfo: {
      admissionDate: new Date('2018-09-01'),
      previousSchool: 'Federal Government College',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Further Mathematics', 'English'],
      house: 'Green House'
    },
    isActive: true
  }
];

const seedStudents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/gma_school');
    console.log('Connected to MongoDB');

    // Clear existing students (optional)
    // await Student.deleteMany({});
    // console.log('Cleared existing students');

    // Insert sample students
    for (const studentData of sampleStudents) {
      const existingStudent = await Student.findOne({ regNumber: studentData.regNumber });
      if (!existingStudent) {
        await Student.create(studentData);
        console.log(`Created student: ${studentData.fullName} (${studentData.regNumber})`);
      } else {
        console.log(`Student already exists: ${studentData.fullName} (${studentData.regNumber})`);
      }
    }

    console.log('Sample students seeded successfully!');
    console.log('\nFor testing registration, you can use:');
    console.log('===========================================');
    sampleStudents.forEach(student => {
      console.log(`Student: ${student.fullName}`);
      console.log(`Reg Number: ${student.regNumber}`);
      console.log(`Parent Email: ${student.parentInfo.email}`);
      console.log(`Division: ${student.division}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error seeding students:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedStudents();
}

export default seedStudents;