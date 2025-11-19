import React from 'react';
import './LoggingTimeLine.css';
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

function LoggingTimeLine() {
    const rowColors = [
        '#3498db',  // Bright Blue
        '#e74c3c',  // Alizarin (Red)
        '#2ecc71',  // Emerald (Green)
        '#f39c12',  // Orange
        '#9b59b6',  // Amethyst (Purple)
        '#1abc9c',  // Turquoise
        '#d35400',  // Pumpkin (Dark Orange)
        '#34495e',  // Wet Asphalt (Dark Blue-Gray)
        '#e84393',  // Pink
        '#27ae60'   // Nephritis (Dark Green)
    ];
    const employees = [
        { id: "000729", name: "Tilak Gamalath", schedule: [{ start: "10:00", end: "17:00" }] },
        { id: "000851", name: "Subash Udayakumari", schedule: [{ start: "8:00", end: "11:00" }] },
        { id: "000915", name: "Nirosh Jayaratne", schedule: [{ start: "8:00", end: "10:00" }] },
        { id: "010402", name: "Lalith Gallege", schedule: [{ start: "8:00", end: "14:00" }] },
        { id: "010447", name: "Dileepa Perera", schedule: [{ start: "10:00", end: "13:00" }] },
        { id: "010514", name: "Kainga Pulleperuma", schedule: [{ start: "11:00", end: "16:00" }] },
        { id: "010689", name: "Thushani Wathurapatha", schedule: [{ start: "9:00", end: "12:00" }] },
        { id: "010816", name: "Janaka", schedule: [{ start: "8:00", end: "10:00" }, { start: "17:00", end: "20:00" }] },
        { id: "011087", name: "Ajith Rathnayake", schedule: [{ start: "10:00", end: "12:00" }, { start: "18:00", end: "21:00" }] },
        { id: "011345", name: "Nalaka Panagala", schedule: [{ start: "9:00", end: "12:00" }] },
        { id: "011448", name: "Randy Sillara Mohamed Naeem Mohamed Shan", schedule: [{ start: "8:00", end: "14:00" }] },
        { id: "011551", name: "Amila Lokugehawatta", schedule: [{ start: "10:00", end: "12:00" }] },
        { id: "012727", name: "Sanjaya Engineer", schedule: [{ start: "8:00", end: "10:00" }] },
    ];

    const timeToPosition = (time) => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = (hour - 8) * 60 + minute; 
        return (totalMinutes / (13 * 60)) * 100; 
    };

    return (
        <div className="LoggingTimeLine-main-content">
            <div className="LoggingTimeLine-direction-bar">
                Dashboard {'>'} Logging TimeLine
            </div>
            <div className="LoggingTimeLine-content2">
                <div className="LoggingTimeLine-graph-title-bar">
                    <div className="LoggingTimeLine-graph-title-bar-p1">
                        <div className="LoggingTimeLine-graph-title-bar-p1-day">
                            Today
                        </div>
                        <GrFormPrevious className="LoggingTimeLine-graph-title-bar-p1-icon"/>
                        <MdNavigateNext className="LoggingTimeLine-graph-title-bar-p1-icon"/>
                    </div>
                    <div className="LoggingTimeLine-graph-title-bar-p2">
                        <div className="LoggingTimeLine-graph-title-bar-p2-graphTitle">
                            MARCH 24, 2025
                        </div>
                    </div>
                    <div className="LoggingTimeLine-graph-title-bar-p3">
                        <div className="LoggingTimeLine-graph-title-bar-p3-text-boxes">Day</div>
                        <div className="LoggingTimeLine-graph-title-bar-p3-text-boxes">3 Days</div>
                        <div className="LoggingTimeLine-graph-title-bar-p3-text-boxes">Week</div>
                        <div className="LoggingTimeLine-graph-title-bar-p3-text-boxes">Month</div>
                    </div>
                </div>
                <div className="LoggingTimeLine-graph-container">
                <div className="LoggingTimeLine-graph-container-header">
    <div className="LoggingTimeLine-graph-container-header-employeelable">EMPLOYEE</div>
    <div className="LoggingTimeLine-graph-container-header-timelineHours">
        {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'].map((time, index) => (
            <div
                key={index}
                className="LoggingTimeLine-graph-container-header-timelineHours-hour-label"
                style={{
                    position: 'absolute',
                    left: `${(index / 13) * 100}%`,
                    padding: '10px',
                    fontSize: '14px'
                }}
            >
                {time}
            </div>
        ))}
    </div>
</div>
                    <div className="LoggingTimeLine-graph-container-body">
                        {employees.map((employee, index) => (
                            <div key={index} className="LoggingTimeLine-graph-container-body-timeline-row">
                                <div className="LoggingTimeLine-graph-container-body-employeeInfo">
                                    <div className="LoggingTimeLine-graph-container-body-employeeId">{employee.id}</div>
                                    <div className="LoggingTimeLine-graph-container-body-employeeName">{employee.name}</div>
                                </div>
                                <div className="LoggingTimeLine-graph-container-body-timelineBar">
                                {employee.schedule.map((slot, slotIndex) => {
                                    const left = timeToPosition(slot.start);
                                    const width = timeToPosition(slot.end) - left;
                                    const rowColor = rowColors[index % rowColors.length];
                                    return (
                                    <div
                                        key={slotIndex}
                                        className="LoggingTimeLine-graph-container-body-scheduleSlot"
                                        style={{
                                            left: `${left}%`,
                                            width: `${width}%`,
                                            backgroundColor: rowColor,
                                        }}
                                    >
                                        {slot.start} - {slot.end}
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 

export default LoggingTimeLine;