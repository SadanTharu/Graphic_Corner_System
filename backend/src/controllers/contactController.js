const Message = require('../models/Message');

// Public: Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    
    const newMessage = new Message({
      name,
      email,
      phone: phone || '',
      service: service || 'General Inquiry',
      message,
      status: 'new'
    });
    
    await newMessage.save();
    
    // TODO: Send email notification to admin
    // For now, just return success
    
    res.json({ message: 'Thank you for your message. We will get back to you soon!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all contact messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message marked as read', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
