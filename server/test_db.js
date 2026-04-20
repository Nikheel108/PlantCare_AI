import mongoose from 'mongoose';

const uris = [
  'mongodb+srv://admin:Nck%402005@cluster0.yz38w6c.mongodb.net/?appName=Cluster0',
  'mongodb+srv://admin:Nck@2005@cluster0.yz38w6c.mongodb.net/?appName=Cluster0',
  'mongodb+srv://admin:<Nck%402005>@cluster0.yz38w6c.mongodb.net/?appName=Cluster0',
];

async function test() {
  for (const uri of uris) {
    console.log(`Testing: ${uri}`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('SUCCESS!');
      await mongoose.disconnect();
      return;
    } catch (e) {
      console.error(`FAILED: ${e.message}`);
    }
  }
}

test();
