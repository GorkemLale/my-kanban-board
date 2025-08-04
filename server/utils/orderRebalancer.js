const Task = require('../models/Task');

const rebalanceTasks = async (boardId, status) => {
    const tasks = await Task.find({ boardId, status }).sort({order: -1});
    
    let max_order = Math.pow(2,50);
    for (const task of tasks){
        console.log(typeof task);  // MongoDB document'tir. kendi süslü parantezi var. O yüzden aşağıda süslü parantez gelmedi.
        await Task.findByIdAndUpdate( task._id , {order: max_order});  // task'in kendisi
        max_order /=2;
    }
};

module.exports = rebalanceTasks;