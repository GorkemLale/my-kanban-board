import Button from '../../components/Button/Button';
import './TaskCard.css';

function TaskCard({ task, onEdit, onDelete}) {
    return (
        <div className="task-card">
            <div className="task-header">
                <h3 className="task-title">
                    {task.title}
                </h3>
                <div clasName="task-actions">
                    <Button onClick={() => onEdit(task)} className="btn-edit">
                        ✏️
                    </Button>
                    <Button onClick={() => onDelete(task.id)} className="btn-delete">
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