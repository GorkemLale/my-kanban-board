import { TaskCard } from '../TaskCard';
import Button from '../../../../components/Button/Button';
import './TaskList.css';
import plusIcon from '../../../../assets/plus.png'
import { useState } from 'react';
import { getRandomColor } from '../../../utils';



export function TaskList({ title, status, tasks = [], onAddTask, onEditTask, onDeleteTask, colors }) {  // tasks'e = [] sonradan eklendi çünkü uncaught runtime errors aldık.
    // tasks = [] çünkü Eğer tasks prop'u gelmezse varsayılan olarak boş array kullan. Neden hata aldık(yanılmışım, bir aşağıda asıl doğruyu anlatıyorum): KanbanBoard'dan getTasksByStatus() fonskiyonu bazen undefined döndürüyor olabilir.
    // Aslında problem yukarıdakinden de değilmiş, tasks'e girdi sağlayan getTaskByStatus() fonksiyonuna return eklemeyi unutmuşum. Ondan dolayı da undefined dönüyordu. Ama [] parantezinin kalması kodu daha güvenli hale getitir.
    const [isAdding, setIsAdding] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [newTaskColor, setNewTaskColor] = useState("");
    // const [isEmpty, setIsEmpty] = use

    const handleAddClick = () => {
        setNewTaskColor(getRandomColor());
        console.log("butona tıklandı ve renk atandı.", newTaskColor);
    };

    return (
        <div className="task-list">
            <div className="task-list-header">
                {title}
            </div>

            <div className="add-task-container">
                <Button onClick={(e) => {setIsAdding(!isAdding); handleAddClick();}} className="btn-add-task"  style={{ height: '50px', padding: '0px' }}>
                    <div className="plus-icon-container">
                        <img
                            alt="+" src={plusIcon} style={{width: '30px', height: '30px'}}
                        />
                    </div>

                    {/* Geçişli button-input */}
                    <div className="add-task-text">    
                        Add Task
                    </div>
                </Button>
            </div>

            
            <div className="task-list-content">
                {isAdding && (
                    <TaskCard
                        isNew={true}
                        task={{ title: '', description: '', priority: 'medium', color: newTaskColor }}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onSave={(taskData) => {  // bunu burada tanımlıyoruz, parent olan KanbanBoard'dan kalıtmıyoruz. TaskCard buradan kalıtıyor.
                            console.log("işte değerimiz bu:", taskData, typeof taskData);
                            onAddTask(status, taskData);
                            setIsAdding(false);
                        }}
                        onCancel={() => setIsAdding(false)}
                    />
                )}

                {tasks.map(task => (  // div döndürmeye gerek yok zaten TaskCard Component'ini tanımlarken gerekli tanımlamalar yapıldı. biz sadece input vereceğiz.
                    <TaskCard 
                        key={task._id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        isNew={false}
                    />
                ))}

                {tasks.length === 0 && (
                    <div className="empty-list">
                        Henüz görev yok    
                    </div>
                )}
            </div>
        </div>
    );
};

// export default TaskList;
