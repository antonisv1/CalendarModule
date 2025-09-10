import React from "react";
import styles from "../modules/CalendarModule.module.css";

export default function CalendarCard({ event, onDetails }) {
  return (
    <div className={styles.card} onClick={onDetails}>
      <div className={styles.eventContent}>
        <div className={styles.eventInfo}>
          <div className={styles.eventTitle}>{event.title}</div>
          <div className={styles.eventMeta}>
            {event.dateText}
            {event.location ? ` • ${event.location}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}