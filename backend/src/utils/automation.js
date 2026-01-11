const Content = require('../models/Content');

/**
 * Automatically generates Content tasks for a client based on their package services.
 * Distributes deadlines equally across a 30-day period.
 * 
 * @param {string} clientId - The string ID of the client.
 * @param {Array} services - Array of service objects { name, count }.
 */
const generateContentsFromPackage = async (clientId, services) => {
    try {
        if (!services || !services.length) return;

        // Flatten services into a single array of tasks
        const tasksToCreate = [];
        services.forEach(service => {
            const count = Number(service.count) || Number(service.quantity) || 0;
            const name = service.name || service.title || 'Task';

            for (let i = 1; i <= count; i++) {
                tasksToCreate.push({
                    title: `${name} #${i}`,
                    serviceType: name
                });
            }
        });

        const totalTasks = tasksToCreate.length;
        if (totalTasks === 0) return;

        // Standard month length for distribution
        const daysInMonth = 30;
        const interval = daysInMonth / totalTasks;

        const contents = tasksToCreate.map((task, index) => {
            const deadlineDate = new Date();
            // Calculate day of the month for this task
            const daysToAdd = Math.round((index + 1) * interval);
            deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);

            return {
                clientId,
                title: task.title,
                status: 'pending',
                deadline: deadlineDate,
                notes: `Automatically generated from package for ${task.serviceType}`
            };
        });

        await Content.insertMany(contents);
        console.log(`Successfully automated ${totalTasks} tasks for client ${clientId}`);
    } catch (err) {
        console.error('Content Automation Error:', err);
        // We don't throw here to avoid breaking the core package activation flow,
        // but we log the error for monitoring.
    }
};

module.exports = { generateContentsFromPackage };
