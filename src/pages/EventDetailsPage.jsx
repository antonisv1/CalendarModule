import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Spinner, Text, Link, IconButton } from "@fluentui/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import styles from "../modules/CalendarModule.module.css";


dayjs.extend(utc);


function ensureEnd(start, end) {
  return end || dayjs(start).add(1, "hour").toISOString();
}

function buildICS(evt) {
  const start = dayjs(evt.start).utc().format("YYYYMMDDTHHmmss[Z]");
  const end = dayjs(ensureEnd(evt.start, evt.end))
    .utc()
    .format("YYYYMMDDTHHmmss[Z]");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${evt.id || Date.now()}@calendar`,
    `DTSTAMP:${dayjs().utc().format("YYYYMMDDTHHmmss[Z]")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${evt.title || "Untitled Event"}`,
    `DESCRIPTION:${evt.description || ""}`,
    evt.location ? `LOCATION:${evt.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadIcs(evt) {
  const blob = new Blob([buildICS(evt)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(evt.title || "event").replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const API_URL_ALL_EVENTS =
  "https://prod-179.westeurope.logic.azure.com:443/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ";

export default function EventDetailsPage() {
  const { id } = useParams();
  const history = useHistory();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        const res = await fetch(API_URL_ALL_EVENTS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error("API error " + res.status);

        const data = await res.json();
        const foundEvent = (data.value || []).find((e) => String(e.ID) === id);

        if (foundEvent) {
          setEvent({
            id: String(foundEvent.ID),
            title: foundEvent.Title,
            description: foundEvent.Description,
            location: [
              foundEvent.AddressLine1,
              foundEvent.AddressLine2,
              foundEvent.City,
              foundEvent.Country,
            ]
              .filter(Boolean)
              .join(", "),
            start: foundEvent.EventStartDate,
            end: foundEvent.EventEndDate,
            category: foundEvent.Category,
            banner: foundEvent.BannerUrl,
            author: foundEvent.Author,
            editor: foundEvent.Editor,
            created: foundEvent.Created,
            modified: foundEvent.Modified,
          });
        } else {
          setError("Event not found.");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.detailsPageWrapper}>
        <Spinner size={3} label="Loading event details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detailsPageWrapper}>
        <div className={styles.error}>{error}</div>
        <IconButton
          iconProps={{ iconName: "Cancel" }}
          aria-label="Close"
          onClick={() => history.goBack()}
          className={styles.closeButton}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.detailsPageWrapper}>
        <Text>Event not found.</Text>
        <IconButton
          iconProps={{ iconName: "Cancel" }}
          aria-label="Close"
          onClick={() => history.goBack()}
          className={styles.closeButton}
        />
      </div>
    );
  }

  const { title, description, location, start, end, banner, author, editor, created, modified, category } = event;
  const startDate = dayjs(start);
  const endDate = dayjs(ensureEnd(start, end));

  const isAllDay =
    startDate.format("HH:mm") === "00:00" &&
    endDate.format("HH:mm") === "23:59";

  return (
    <div className={styles.detailsPageWrapper}>
    <div className={styles.detailsCard}>

  {/* Row 1: Banner */}
  <div className={styles.bannerRow}>
    <div className={styles.bannerImageSection}>
      <img src={banner} alt={title} className={styles.bannerImage} />
    </div>
    <div className={styles.bannerInfoSection}>
      <div className={styles.bannerTop}>
        <div className={styles.detailsDateBox}>
          <span className={styles.dateMonth}>{startDate.format("MMM").toUpperCase()}</span>
          <span className={styles.dateDay}>{startDate.format("DD")}</span>
        </div>
        <IconButton className={styles.closeButton} iconProps={{ iconName: "Cancel" }} onClick={() => history.goBack()} />
      </div>
      <h1 className={styles.detailsPageTitle}>{title}</h1>
      <div className={styles.bannerCategory}>{category}</div>
    </div>
  </div>

  {/* Row 2: Description + Info */}
  <div className={styles.detailsRow}>
    <div className={styles.detailsDescriptionSection}> <h2 className={styles.sectionHeading}>DESCRIPTION</h2>
        <div
          className={styles.descriptionText}
          dangerouslySetInnerHTML={{ __html: description || "No description provided." }}
        />

</div>
    <div className={styles.detailsInfoSection}><h2 className={styles.sectionHeading}>DATE AND TIME</h2>
        <p className={styles.infoText}>
          {isAllDay
            ? "All-day Event"
            : `${startDate.format("ddd, MMM DD YYYY h:mm A")} - ${endDate.format("ddd, MMM DD YYYY h:mm A")}`}
        </p>
        <Link onClick={() => downloadIcs(event)} className={styles.addCalendarLink}>
          Add to Calendar
        </Link>

        <h2 className={styles.sectionHeading}>LOCATION</h2>
        <p className={styles.infoText}>{location || "No location specified."}</p>
        {location && (
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            className={styles.viewMapLink}
          >
            View Map
          </Link>
        )}

</div>
  </div>
 

  {/* Row 3: Footer */}
  <div className={styles.footerWrapper}>
  <div className={styles.footerMeta}> <Text variant="small">
        {author && created && `Created by ${author} on ${dayjs(created).format("DD/MM/YYYY HH:mm")}`}<br />
        {editor && modified && `Modified by ${editor} on ${dayjs(modified).format("DD/MM/YYYY HH:mm")}`}
      </Text>
  </div>
  </div>
</div>
</div>

  );
}