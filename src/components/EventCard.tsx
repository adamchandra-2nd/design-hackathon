import { EVENT } from "../config";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import "./EventCard.css";

/** Figma: Event Info — floating invite summary at the top of pre-event screens. */
export function EventCard({ status }: { status?: React.ReactNode }) {
  return (
    <section className="event-card panel glass">
      <span className="event-card__tags">
        <Badge type="next">Undangan</Badge>
        {status}
      </span>
      <div className="event-card__body">
        <h1 className="t-display-h6 panel__title">{EVENT.name}</h1>
        <span className="event-card__meta t-p-h5">
          <span className="event-card__row">
            <Icon name="Calendar" size={16} />
            {EVENT.dateLabel}
          </span>
          <span className="event-card__row">
            <Icon name="MapPin" size={16} />
            {EVENT.place}
          </span>
        </span>
      </div>
    </section>
  );
}
