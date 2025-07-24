import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    closestSensor,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultKeyboardCoordinateGetter,  // niye virgül koyuyor?
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskList from './TaskList';
import TaskCard from './TaskCard';
import './KanbanBoard.css';

function KanbanBoard() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Login sayfası tasarımı', description: 'Kullanıcı girişi için modern tasarım', priority: 'high', status: 'backlog' },
        { id: 2, title: 'API dokümantasyonu', description: 'REST API endpointleri', priority: 'medium', status: 'todo' },
        { id: 3, title: 'Database kurulumu', description: 'MongoDB konfigürasyonu', priority: 'high', status: 'inprogress' },
        { id: 4, title: 'Frontend geliştirme', description: 'React component\'leri', priority: 'medium', status: 'done' }
    ]);

    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Görevleri status'a göre filtrele
    const getTasksByStatus = (status) => {
        return tasks.filter((task => task.status === status));
    };

    // Drag başladığında
    function handleDragStart(event) {
        const { active } = event;
        setActiveTask(tasks.find(task => task.id === active.id));
    }

    // Drag bittiğinde
    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const activeTask = tasks.find(task => task.id === active.id);
        const newStatus = over.id;

        if (activeTask && activeTask.status !== newStatus) {
            setTasks(tasks.map(task => 
                task.id === active.id ? {...task, status: newStatus} : task
            ));
        }

        setActiveTask(null);
    }

    // Yeni görev ekleme
    const handleAddTask = (status) => {
        const taskTitle = prompt('Görev başlığı girin:');  // pop-up açılır girdi penceresi. input'un penceremsi hali :)
        if (taskTitle) {
            const newTask = {
                id: Date.now(),  // Basit ID
                title: taskTitle,
                description: '',
                priority: 'medium',
                status: status
            };
            setTasks([...tasks, newTask]);
        }
    };

    // Görev düzenleme
    const handleEditTask = (task) => {
        console.log(task);
        const newTitle = prompt('Yeni başlık:', task.title);  // sağındaki default değer. yani card'ın adını değiştirmek istediğimizde önceki adını backspace'e basarak sileceğiz.
        if (newTitle) {
            setTasks(tasks.map(t => 
                t.id === task.id ? {...t, title: newTitle} : t
            ));
        }

    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm('Bu görebi silmek istediğinize emin misiniz?')) {
            setTasks(tasks.filter(t => t.id !== taskId));
        }
    };
    
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} 
        >
            <div className="kanban-board">
                <h1 className="board-title">Kanban Board</h1>

                <div className="board-lists">
                    {['backlog','todo','inprogress','done'].map(listName => (
                        <TaskList 
                            id={listName}
                            title= {listName}
                            tasks={getTasksByStatus(listName)}
                            onAddTask={() => handleAddTask(listName)}
                            onEditTask={handleEditTask}  // girdisiz olarak gider. son varacağı yer olan TaskCard.js'te 2 satır yukarıda gönderilen ve onla gittiği yere kadar gelen task'i, vardığı yerde onClick'e eşitlenirken girdi olarak alır. Aslında 2 satır yukarıda ilgili task'in grup arkadaşları da onla beraberdir. Bir sonraki aşama olan TaskList.js'te bireyselleşir ve tek tek TaskCard.js'in içine gönderilirler.
                            onDeleteTask={handleDeleteTask}  // Yukarıda dediklerimin aynısı delete için de geçerlidir. Tek fark son aşamada onClick'e eşitlenirken handle fonksiyonuna girdi olarak bunca badire atlatıp filtrelene filtrelene gelen task'in bir daha filtrelenmesi sonucu id'sinin alınmasıdır. 
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div style={{ transform: 'rotate(5deg)' }}>
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default KanbanBoard;