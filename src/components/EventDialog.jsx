import React from "react";
import { Dialog, DialogType, DialogFooter, DefaultButton, PrimaryButton } from "@fluentui/react";
import dayjs from "dayjs";
import styles from "../modules/CalendarModule.module.css";

export default function EventDialog({ active, onClose, onDownload }) {
  return (
    <Dialog
      hidden={!active}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.normal,
        title: active?.title,
        subText: active
          ? dayjs(active.start).format("MMM D, YYYY h:mm A")
          : "",
      }}
    >
      <div className={styles.dialogDescription}>
        {active?.description || "No description"}
      </div>
      <DialogFooter>
        <DefaultButton text="Download" onClick={() => onDownload(active)} />
        <PrimaryButton text="Close" onClick={onClose} />
      </DialogFooter>
    </Dialog>
  );
}
