import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  api: String,
  error: String,
  response: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, index: { expires: '30d' } }
});

export default mongoose.model('ErrorLog', errorLogSchema);
