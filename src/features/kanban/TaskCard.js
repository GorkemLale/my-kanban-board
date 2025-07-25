import Button from '../../components/Button/Button';
import './TaskCard.css';
import { useState, useEffect } from 'react';


function TaskCard({ task, onEdit, onDelete}) {
    const [showMenu, setShowMenu] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [cardColor, setCardColor] = useState(task.color);

    const inputGonder = (editedValue, whichOne, ID) => {
        if(whichOne !== 'title') {  // Bu ayrımı yapıyoruz çünkü sadece title zorunlu ve boş bırakılmamalı. yani diğerleri opsiyonel ama title zorunlu.
            onEdit(editedValue, whichOne, ID);
        } else if (whichOne === 'title' && editedValue.trim()) {  // işte burada da title boş ise göndertmiyoruz.
            onEdit(editedValue.trim(), whichOne, ID);
            setEditTitle(editedValue.trim());
        } else {
            console.log('Task\'in böyle bir alt değişkeni yok');
        }
        
        setShowMenu(false);
    }



    // const fareCardUzerinde () => {
        
    // };

    // const fareCardDisinda () => {
    //     setCardColor("")
    // };
    

    return (
        <div 
            className="task-card" 
            style={{ 
                '--card-color': cardColor
            }}
            onClick={(e) => setShowMenu(!showMenu)}
            // onMouseOver={}
        >
            <div className="task-card-padding-div">
                <div 
                    className="task-header"
                >
                        <input 
                            className='menu-edit-input'
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (inputGonder(e.target.value, "title", task.id))}
                            onClick={(e) => {e.stopPropagation(); setShowMenu(!showMenu);}}
                        />
                </div>  
                
                {task.description && task.priority && (
                        <div 
                            className="task-actions"
                            >
                            <div>
                                {task.description && (
                                    <p className="task-description">{task.description}</p>
                                )}
                            </div>
                            <div className="task-footer">
                                {task.priority && (
                                    <span className={`task-priority priority-${task.priority}`}>
                                        {task.priority}
                                    </span>
                                )}
                            </div>
                        </div>
                )}
            </div>
        </div>
    );
}

export default TaskCard;