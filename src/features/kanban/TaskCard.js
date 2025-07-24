import { useDraggable } from '@dnd-kit/core';
import Button from '../../components/Button/Button';
import './TaskCard.css';

function TaskCard({ task, onEdit, onDelete}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translat3d(${transform.x}.px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style} 
            className={`task-card" ${isDragging ? 'dragging' : ''}`}
        >
            <div className="task-header">
                <h3 className="task-title" {...listeners} {...attributes}>
                    {task.title}
                </h3>
                <div className="task-actions">
                    <Button onClick={(e) => {e.stopPropagation(); onEdit(task); }} className="btn-edit">
                        ✏️
                    </Button>
                    <Button onClick={(e) => {e.stopPropagation(); onDelete(task.id); }} className="btn-delete">
                        🗑️
                    </Button>
                </div>
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}
            <div className="task-footer">
                <span className="task-id">#{task.id}</span>
                {task.priority && (
                    <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                    </span>
                )}
            </div>
        </div>
    );
}

export default TaskCard;