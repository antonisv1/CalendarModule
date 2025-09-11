import React, { useState, useEffect } from "react";
import { Spinner, Text, Link } from "@fluentui/react";
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";
import styles from "./CalendarModule.module.css";

const API_URL =
  "https://prod-179.westeurope.logic.azure.com:443/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Cras malesuada nisl!",
    description: "Sample event 1 description.",
    location: "Jr. Flores No. 336, Malang, Indonesia",
    start: dayjs().add(2, "day").toISOString(),
  },
  {
    id: "2",
    title: "Aenean consectetur risus ut vulputate",
    description: "Sample event 2 description.",
    location: "1833 Abshire Viaduct, North Elisa, United States",
    start: dayjs().add(5, "day").toISOString(),
  },
  {
    id: "3",
    title: "Aenean vehicula tortor id magna laoreet",
    description: "Sample event 3 description.",
    location: "2453 Ernser Terrace, Stantonstad, United States",
    start: dayjs().add(15, "day").toISOString(),
  },
];

export default function CalendarModule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) throw new Error("API error " + res.status);

        const data = await res.json();
        console.log(data);
        const mapped = (data.value || []).map((e) => ({
          id: e.ID,
          title: e.Title,
          description: e.Description,
          location: [e.AddressLine1, e.AddressLine2, e.City, e.Country]
            .filter(Boolean)
            .join(", "),
          start: e.EventStartDate,
          end: e.EventEndDate,
          category: e.Category,
          banner: e.BannerUrl,
        }));

        setEvents(mapped.length ? mapped : MOCK_EVENTS);
      } catch (err) {
        console.error(err);
        setError("Failed to load events. Using fallback data.");
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

const formatDate = (iso) => {
  const eventDate = dayjs(iso);
  const today = dayjs();
  const daysDiff = eventDate.diff(today, "day");

  const isSameWeek = eventDate.isSame(today, "week");

  if (isSameWeek) {
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    return `in ${daysDiff} days`;
  }

  return eventDate.format("MM/DD/YYYY");
};



  // Show ALL future events, sorted by date
  const upcomingEvents = events
    .filter((evt) => dayjs(evt.start).isAfter(dayjs()))
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className={styles.container}>
      <div className={styles.upcomingEventsWidget}>
        <div className={styles.widgetHeader}>
          <span role="img" aria-label="calendar" className={styles.monochromeIcon}>
            🗓️
          </span>{" "}
          Upcoming Events
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <Spinner size={3} label="Loading..." />
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {upcomingEvents.length === 0 && !loading && <Text>No upcoming events.</Text>}

        {upcomingEvents.map((evt) => (
          <div className={styles.widgetEventItem} key={evt.id}>
            <Link
              className={styles.widgetEventLink}
              onClick={() => history.push(`/events/${evt.id}`)}
            >
              {evt.title} – {formatDate(evt.start)}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
