import TaskCard from './TaskCard';
import Button from '../../components/Button/Button';
import './TaskList.css';

function TaskList({ title, tasks = [], onAddTask, onEditTask, onDeleteTask }) {  // tasks'e = [] sonradan eklendi çünkü uncaught runtime errors aldık.
    // tasks = [] çünkü Eğer tasks prop'u gelmezse varsayılan olarak boş array kullan. Neden hata aldık(yanılmışım, bir aşağıda asıl doğruyu anlatıyorum): KanbanBoard'dan getTasksByStatus() fonskiyonu bazen undefined döndürüyor olabilir.
    // Aslında problem yukarıdakinden de değilmiş, tasks'e girdi sağlayan getTaskByStatus() fonksiyonuna return eklemeyi unutmuşum. Ondan dolayı da undefined dönüyordu. Ama [] parantezinin kalması kodu daha güvenli hale getitir.

    return (
        <div className="task-list">
            <div className="task-list-header">
                <h2 className="task-list-title">{title}</h2>
                <span className="task-count">{tasks.length}</span>
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

            <Button onClick={onAddTask} className="btn-add-task">
                + Görev ekle
            </Button>
        </div>
    );
}

export default TaskList;
