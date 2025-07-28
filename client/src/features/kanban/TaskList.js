import TaskCard from './TaskCard';
import Button from '../../components/Button/Button';
import './TaskList.css';
import plusIcon from '../../assets/plus.png'
import { useState } from 'react';



function TaskList({ title, status, tasks = [], onAddTask, onEditTask, onDeleteTask }) {  // tasks'e = [] sonradan eklendi çünkü uncaught runtime errors aldık.
    // tasks = [] çünkü Eğer tasks prop'u gelmezse varsayılan olarak boş array kullan. Neden hata aldık(yanılmışım, bir aşağıda asıl doğruyu anlatıyorum): KanbanBoard'dan getTasksByStatus() fonskiyonu bazen undefined döndürüyor olabilir.
    // Aslında problem yukarıdakinden de değilmiş, tasks'e girdi sağlayan getTaskByStatus() fonksiyonuna return eklemeyi unutmuşum. Ondan dolayı da undefined dönüyordu. Ama [] parantezinin kalması kodu daha güvenli hale getitir.
    const [gorevInput, setGorevInput] = useState("");
    const [gorevButton, setGorevButton] = useState(false);

    return (
        <div className="task-list">
            <div className="task-list-header">
                {title}
            </div>

            <div className="add-task-container">
                <Button onClick={(e) => setGorevButton(!gorevButton)} className="btn-add-task"  style={{ height: '50px', alignItems: 'center', padding: '0px' }}>
   
                            <div className="plus-icon-container">
                                <img
                                    alt="+" src={plusIcon} style={{width: '20px', height: '20px'}}
                                />

                    </div>

                {/* Geçişli button-input */}
                {gorevButton ? (
                    <div className="input-container">    
                        <input className="gorev-ekle"
                            type="text"
                            placeholder="Görev başlığı..."
                            onChange={(e) => {setGorevInput(e.target.value)}}
                            onKeyDown={(e) => e.key === 'Enter' && (onAddTask(status, gorevInput), setGorevButton(false), setGorevInput(""))}
                            onClick={(e) => e.stopPropagation()}
                            />
                        
                    </div>
                ) : (
                    
                    <strong className="button-text">
                        Görev ekle
                    </strong>
                )}
                </Button>
            </div>

            
            <div className="task-list-content">
                {tasks.map(task => (  // div döndürmeye gerek yok zaten TaskCard Component'ini tanımlarken gerekli tanımlamalar yapıldı. biz sadece input vereceğiz.
                    <TaskCard 
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
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
}

export default TaskList;
