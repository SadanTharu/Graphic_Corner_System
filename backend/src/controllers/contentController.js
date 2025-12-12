const Content = require('../models/Content');

// Admin: get all contents
exports.getAllContents = async (req, res) => {
  try {
    const contents = await Content.find();
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: create content
exports.createContent = async (req, res) => {
  try {
    const newContent = await Content.create(req.body);
    res.json({ message: 'Content created', content: newContent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: update content
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndUpdate(id, req.body, { new: true });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content updated', content });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: delete content
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: get content for client
exports.getClientContents = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const contents = await Content.find({ clientId });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
