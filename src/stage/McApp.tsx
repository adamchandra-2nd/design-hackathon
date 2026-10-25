import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/iconPaths";
import { TextField } from "../components/TextField";
import { Toast, ToastIcon } from "../components/Toast";
import { EVENT } from "../config";
import { formatTime } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import { ADMIN_GUESTS, SAMPLE_EVENT_FEEDBACK } from "../admin/data";
import { RoomPicker } from "../admin/pickers";
import {
  ANNOUNCE_TEMPLATES,
  HELP_LABEL,
  MC_SIGNALS,
  PEOPLE,
  QUESTION_GROUPS,
  SCRIPTS,
  SESSIONS,
  personById,
  sessionById,
  type McSignal,
  type StageQuestion,
  type StageQuestionState,
} from "./data";
import { MC_LINKS, type McTab } from "./links";
import { BigTimer, StageCard, StageShell, TimerStrip } from "./StageShell";
import { StageLogin } from "./StageLogin";
import { clockMinute, nextSession, remainingS, sortedSessions, useNow, useStage, useWakeLock, type StageState } from "./store";
import { QCard, ReadMode, Sheet, StageSystem } from "./ui";
import { Welcome } from "./Welcome";

const MC = PEOPLE.find((p) => p.role === "mc")!;
const roomName = (id: string) => ROOMS[roomIndexById(id)].name;
const firstName = (n: string) => n.split(" ")[0];

/** MC side (phone + tablet): runs the rundown, reads guests' questions, signals the speaker. */
export function McApp({ token }: { token: string }) {
  const sc = MC_LINKS[token] ?? MC_LINKS["mc-404"];
  const known = token in MC_LINKS;
  const [system, setSystem] = useState(known ? sc.system : "404");
  const [login, setLogin] = useState(sc.login);
  const [welcome, setWelcome] = useState(!!sc.welcome);
  if (system) return <StageSystem kind={system} onRetry={() => setSystem(undefined)} />;
  if (login) return <StageLogin person={MC} eventLabel={EVENT.name} initial={login} onDone={() => (setLogin(undefined), setWelcome(true))} />;
  if (welcome) return <Welcome person={MC} sessions={sortedSessions()} onDone={() => setWelcome(false)} />;
  return <McMain token={token} />;
}

function McMain({ token }: { token: string }) {
  const sc = MC_LINKS[token] ?? {};
  const [state, update] = useStage(sc.seed?.());
  const now = useNow();
  useWakeLock();
  const [tab, setTab] = useState<McTab>(sc.tab ?? "panggung");
  const [sheet, setSheet] = useState(sc.sheet);
  const [reading, setReading] = useState(!!sc.readMode);
  const [toast, setToast] = useState<{ icon: IconName; title: string; sub: string; urgent?: boolean; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const seenSignal = useRef<number>(sc.toast ? 0 : (state.speakerSignal?.at ?? 0));

  const notify = (t: NonNullable<typeof toast>) => {
    window.clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = window.setTimeout(() => setToast(null), t.urgent ? 9000 : 4000);
  };

  // Speaker → MC signals arrive as toasts (urgent ones stay longer)
  useEffect(() => {
    const s = state.speakerSignal;
    if (!s || s.at <= seenSignal.current) return;
    seenSignal.current = s.at;
    const speaker = personById(sessionById("talkshow").speakerId);
    if (s.kind === "siap") notify({ icon: "Check", title: `${firstName(speaker?.name ?? "Pembicara")} sudah siap`, sub: "Sesi berikutnya bisa dimulai kapan saja." });
    if (s.kind === "bantuan")
      notify({ icon: "Bell", urgent: true, title: `${firstName(speaker?.name ?? "Pembicara")} butuh bantuan`, sub: `${HELP_LABEL[s.help ?? "lainnya"]}. Panitia sudah dikabari otomatis.` });
    if (s.kind === "selesai") notify({ icon: "ArrowRight", title: "Panggung kembali ke MC", sub: "Pembicara sudah selesai. Tutup sesi lalu lanjut." });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.speakerSignal]);

  // A new guest question drops in shortly after opening the live demo
  useEffect(() => {
    if (sc.seed || state.phase !== "live") return;
    const t = window.setTimeout(() => {
      update((s) =>
        s.questions.some((q) => q.id === "q-live")
          ? s
          : { ...s, questions: [...s.questions, { id: "q-live", sessionId: "talkshow", groupId: "kantor", text: "Boleh tahu siapa yang desain interior kantornya?", author: "Gita", at: clockMinute(s, Date.now()), state: "masuk" }] },
      );
      notify({ icon: "Message", title: "Pertanyaan baru", sub: "Gita · Soal kantor baru", action: { label: "Lihat", onClick: () => setTab("pertanyaan") } });
    }, 6000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = state.liveId ? sessionById(state.liveId) : undefined;
  const next = nextSession(state);
  const secs = remainingS(state, now);
  const setQ = (id: string, st: StageQuestionState) => update((s) => ({ ...s, questions: s.questions.map((q) => (q.id === id ? { ...q, state: st } : q)) }));
  const newCount = state.questions.filter((q) => q.state === "masuk" && q.sessionId === (live?.id ?? "talkshow")).length;

  const startSession = (id: string) => {
    update((s) => ({ ...s, phase: "live", liveId: id, startedAt: Date.now(), speaker: sessionById(id).speakerId ? "live" : s.speaker, mcSignal: null }));
    notify({ icon: "ArrowRight", title: `${sessionById(id).title} dimulai`, sub: `Tamu dapat notifikasi pindah ke ${roomName(sessionById(id).roomId)}.` });
  };
  const endSession = () => {
    if (!live) return;
    const last = !next;
    update((s) => ({
      ...s,
      liveId: null,
      doneIds: [...s.doneIds, live.id],
      phase: last ? "ended" : s.phase,
      speaker: live.speakerId ? "selesai" : s.speaker,
      mcSignal: live.speakerId ? { kind: "terima-kasih", at: Date.now() } : s.mcSignal,
    }));
    notify({ icon: "Check", title: `${live.title} selesai`, sub: "Form feedback sesi ini sudah muncul di HP tamu." });
  };
  const signal = (kind: McSignal) => {
    update((s) => ({ ...s, mcSignal: { kind, at: Date.now() } }));
    notify({ icon: "Send", title: `Terkirim ke ${firstName(personById(live?.speakerId)?.name ?? "pembicara")}`, sub: `“${MC_SIGNALS[kind].title}” muncul besar di layarnya.` });
  };

  const strip = live ? (
    <TimerStrip title={live.title} secs={secs} />
  ) : state.phase === "ended" ? (
    <TimerStrip title="Acara selesai" display="Selesai" />
  ) : sc.daysLeft ? (
    <TimerStrip title={EVENT.name} label="hari H" display={`H-${sc.daysLeft}`} />
  ) : (
    next && <TimerStrip title={`Berikutnya: ${next.title}`} label="mulai" display={formatTime(next.start)} />
  );

  const banner = (
    <>
      {sc.offline && (
        <div className="offline-bar">
          <Icon name="WifiOff" size={20} />
          <span className="t-p-h5-bold">Offline. Timer tetap jalan; aksi terkirim begitu tersambung lagi.</span>
        </div>
      )}
      {state.rundownChanged && (
        <div className="offline-bar" style={{ background: "var(--tag-amber-bg)", color: "var(--tag-amber)" }}>
          <Icon name="Calendar" size={20} />
          <span className="t-p-h5-bold" style={{ flex: 1 }}>
            Rundown diubah panitia: Makan siang mundur 15 menit.
          </span>
          <Button
            size="small"
            style="tertiary"
            onClick={() => {
              update((s) => ({ ...s, rundownChanged: false }));
              setSheet("rundown");
            }}
          >
            Lihat
          </Button>
        </div>
      )}
    </>
  );

  const panggung = (
    <Panggung
      state={state}
      now={now}
      daysLeft={sc.daysLeft}
      onStart={startSession}
      onEnd={endSession}
      onSignal={signal}
      onToggleLine={(sid, i) =>
        update((s) => {
          const cur = s.checked[sid] ?? [];
          return { ...s, checked: { ...s.checked, [sid]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] } };
        })
      }
      onVariant={(sid) => update((s) => ({ ...s, scriptVariant: { ...s.scriptVariant, [sid]: ((s.scriptVariant[sid] ?? 0) + 1) % SCRIPTS[sid].length }, checked: { ...s.checked, [sid]: [] } }))}
      onSheet={setSheet}
      onResolveHelp={() => {
        update((s) => ({ ...s, speaker: "live", speakerHelp: undefined }));
        notify({ icon: "Check", title: "Ditandai beres", sub: "Pembicara melihat bantuan sudah ditangani." });
      }}
    />
  );
  const pertanyaan = <Pertanyaan state={state} onSet={setQ} onRead={() => setReading(true)} />;
  const content =
    tab === "panggung" ? panggung : tab === "pertanyaan" ? pertanyaan : tab === "sorotan" ? <Sorotan state={state} onCopied={() => notify({ icon: "Copy", title: "Sapaan disalin", sub: "Tinggal dibacakan." })} /> : (
      <Umumkan
        state={state}
        compose={!!sc.compose}
        onSend={(a) => {
          update((s) => ({ ...s, announcements: [...s.announcements, { ...a, at: clockMinute(s, Date.now()) }] }));
          notify({ icon: "Megaphone", title: "Pengumuman terkirim", sub: "Muncul di HP semua tamu yang hadir." });
        }}
      />
    );
  // Tablet landscape: the other key panel sits next to the current tab
  const aside = tab === "panggung" ? pertanyaan : panggung;
  const picked = state.questions.filter((q) => q.state === "dipilih");

  return (
    <>
      <StageShell
        nav={[
          { id: "panggung", label: "Panggung", icon: "Megaphone" },
          { id: "pertanyaan", label: "Pertanyaan", icon: "Message", count: state.phase === "ended" ? 0 : newCount },
          { id: "sorotan", label: "Sorotan", icon: "Sparkle" },
          { id: "umumkan", label: "Umumkan", icon: "Bell" },
        ]}
        active={tab}
        onNav={setTab}
        strip={strip}
        banner={banner}
        aside={aside}
        toast={
          toast && (
            <Toast
              lead={<ToastIcon icon={toast.icon} tone="accent" />}
              title={toast.title}
              sub={toast.sub}
              action={
                toast.action ? (
                  <Button
                    size="small"
                    block
                    icon="ArrowRight"
                    onClick={() => {
                      toast.action!.onClick();
                      setToast(null);
                    }}
                  >
                    {toast.action.label}
                  </Button>
                ) : undefined
              }
            />
          )
        }
      >
        {content}
      </StageShell>

      {reading && (
        <ReadMode
          list={picked}
          note={live?.speakerId ? `Juga tampil di layar ${firstName(personById(live.speakerId)?.name ?? "")}.` : undefined}
          doneLabel="Sudah dibacakan"
          onDone={(id) => setQ(id, "dibacakan")}
          onSkip={(id) => setQ(id, "dilewati")}
          onClose={() => setReading(false)}
        />
      )}
      {sheet === "rundown" && (
        <Sheet icon="Calendar" tone="teal" title="Rundown hari ini" onClose={() => setSheet(undefined)}>
          <RundownList state={state} />
          <span className="t-p-h5 stage-muted">Jadwal diatur panitia. Kalau ada perubahan, kamu dapat notifikasi.</span>
        </Sheet>
      )}
      {sheet === "panitia" && (
        <Sheet icon="Users" tone="ink" title="Hubungi panitia" onClose={() => setSheet(undefined)}>
          <span className="t-p-h4 stage-muted">Panitia langsung dapat notifikasi di dashboard. Pilih yang paling sesuai:</span>
          <div className="tpl-list">
            {[
              { icon: "Megaphone" as const, title: "Sound / mic bermasalah", body: "Butuh tim teknis ke panggung" },
              { icon: "Users" as const, title: "Tamu butuh bantuan", body: "Ada tamu yang perlu didampingi" },
              { icon: "Clock" as const, title: "Jadwal perlu digeser", body: "Sesi molor atau perlu dipercepat" },
              { icon: "Message" as const, title: "Lainnya", body: "Panitia akan menghubungimu" },
            ].map((o) => (
              <button
                key={o.title}
                type="button"
                className="tpl clay clay-light"
                onClick={() => {
                  setSheet(undefined);
                  update((s) => ({ ...s, panitiaCalled: true }));
                  notify({ icon: "Users", title: "Panitia sudah dikabari", sub: `${o.title}. Tunggu sebentar ya.` });
                }}
              >
                <span className="icon-badge icon-badge--ink icon-badge--S clay clay-accent">
                  <Icon name={o.icon} size={16} />
                </span>
                <span className="tpl__text">
                  <span className="t-p-h4-bold">{o.title}</span>
                  <span className="t-p-h5 stage-muted">{o.body}</span>
                </span>
                <Icon name="ChevronRight" size={20} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

/* ---------------- Panggung ---------------- */

function Panggung({
  state,
  now,
  daysLeft,
  onStart,
  onEnd,
  onSignal,
  onToggleLine,
  onVariant,
  onSheet,
  onResolveHelp,
}: {
  state: StageState;
  now: number;
  daysLeft?: number;
  onStart: (id: string) => void;
  onEnd: () => void;
  onSignal: (k: McSignal) => void;
  onToggleLine: (sessionId: string, i: number) => void;
  onVariant: (sessionId: string) => void;
  onSheet: (s: "rundown" | "panitia") => void;
  onResolveHelp: () => void;
}) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const live = state.liveId ? sessionById(state.liveId) : undefined;
  const next = nextSession(state);
  const focus = live ?? next;
  const speaker = personById(focus?.speakerId);
  const secs = remainingS(state, now);
  const variant = focus ? (state.scriptVariant[focus.id] ?? 0) % (SCRIPTS[focus.id]?.length ?? 1) : 0;
  const script = focus ? (SCRIPTS[focus.id]?.[variant] ?? []) : [];
  const checked = focus ? (state.checked[focus.id] ?? []) : [];
  const ended = state.phase === "ended";
  const sent = state.mcSignal;

  return (
    <>
      <header className="stage-head">
        <div className="stage-head__text">
          <h1 className="t-display-h6 stage-head__title">Panggung</h1>
          <p className="t-p-h5 stage-head__sub">
            {daysLeft ? `${EVENT.dateLabel} · ${daysLeft} hari lagi` : `Minggu, 8 Nov · ${formatTime(clockMinute(state, now))}`}
          </p>
        </div>
        <div className="stage-card__aside">
          <button type="button" className="icon-btn clay clay-light" aria-label="Rundown" onClick={() => onSheet("rundown")}>
            <Icon name="Calendar" size={20} />
          </button>
          <button type="button" className="icon-btn clay clay-light" aria-label="Hubungi panitia" onClick={() => onSheet("panitia")}>
            <Icon name="Users" size={20} />
          </button>
        </div>
      </header>

      {/* One orange card: what's on stage now, "Berikutnya" in a light container inside */}
      <section className="now-card clay clay-accent">
        <div className="now-card__main">
          {live ? (
            <>
              <span className="agenda-card__tags">
                <Badge type="now">Sekarang</Badge>
              </span>
              <h2 className="now-card__title">{live.title}</h2>
              <span className="now-card__meta t-p-h5">
                <span>
                  <Icon name="MapPin" size={16} />
                  {roomName(live.roomId)}
                </span>
                <span>
                  <Icon name="Users" size={16} />
                  PIC {live.pic}
                </span>
              </span>
              <BigTimer secs={secs} total={(live.end - live.start) * 60} />
              {speaker && (
                <div className={`speaker-chip speaker-chip--${state.speaker}`}>
                  <Avatar initial={speaker.name.charAt(0)} size="S" />
                  <span className="speaker-chip__text">
                    <span className="t-p-h4-bold one-line">{speaker.name}</span>
                    <span className="t-p-h5 speaker-chip__state">
                      {state.speaker === "bantuan" ? `Butuh bantuan: ${HELP_LABEL[state.speakerHelp ?? "lainnya"]}` : state.speaker === "live" ? "Sedang bicara" : state.speaker === "siap" ? "Siap" : "Selesai"}
                    </span>
                  </span>
                  {state.speaker === "bantuan" && (
                    <Button size="small" style="tertiary" onClick={onResolveHelp}>
                      Beres
                    </Button>
                  )}
                </div>
              )}
              <Button block style="secondary" icon="Check" onClick={() => setConfirmEnd(true)}>
                Selesaikan sesi
              </Button>
            </>
          ) : ended ? (
            <>
              <span className="agenda-card__tags">
                <Badge type="claimed" icon="Check">Selesai</Badge>
              </span>
              <h2 className="now-card__title">Acara selesai. Terima kasih, {firstName(PEOPLE[0].name)}!</h2>
              <span className="t-p-h4">Semua {SESSIONS.length} sesi sudah berjalan. Tamu sedang mengisi feedback akhir.</span>
            </>
          ) : daysLeft ? (
            <>
              <span className="agenda-card__tags">
                <Badge type="next" icon="Clock">Belum mulai</Badge>
              </span>
              <h2 className="now-card__title">{daysLeft} hari lagi</h2>
              <span className="t-p-h4">Pelajari rundown dan naskah dulu. Timer dan tombol aktif di hari H.</span>
            </>
          ) : (
            next && (
              <>
                <span className="agenda-card__tags">
                  <Badge type="next" icon="Clock">{state.phase === "pre" ? "Belum mulai" : "Jeda"}</Badge>
                </span>
                <h2 className="now-card__title">{next.title}</h2>
                <span className="now-card__meta t-p-h5">
                  <span>
                    <Icon name="Clock" size={16} />
                    {formatTime(next.start)}–{formatTime(next.end)}
                  </span>
                  <span>
                    <Icon name="MapPin" size={16} />
                    {roomName(next.roomId)}
                  </span>
                  <span>
                    <Icon name="Users" size={16} />
                    PIC {next.pic}
                  </span>
                </span>
                {speaker && (
                  <div className={`speaker-chip speaker-chip--${state.speaker}`}>
                    <Avatar initial={speaker.name.charAt(0)} size="S" />
                    <span className="speaker-chip__text">
                      <span className="t-p-h4-bold one-line">{speaker.name}</span>
                      <span className="t-p-h5 speaker-chip__state">{state.speaker === "siap" ? "Sudah siap di ruangan" : "Belum konfirmasi siap"}</span>
                    </span>
                  </div>
                )}
                <Button block style="secondary" icon="ArrowRight" onClick={() => onStart(next.id)}>
                  Mulai {next.title}
                </Button>
              </>
            )
          )}
        </div>
        {live && next && (
          <div className="now-card__next">
            <span className="t-p-h5-bold now-card__label">Berikutnya</span>
            <span className="t-p-h3-bold one-line">{next.title}</span>
            <span className="t-p-h5 one-line">
              {roomName(next.roomId)} · {formatTime(next.start)}–{formatTime(next.end)} · PIC {next.pic}
            </span>
          </div>
        )}
      </section>

      {ended && (
        <StageCard icon="Check" tone="green" title="Ringkasan acara">
          <dl className="info-rows">
            <div className="info-row">
              <Icon name="Calendar" size={16} />
              <dt className="t-p-h5">Sesi</dt>
              <dd className="t-p-h4-bold">{state.doneIds.length} selesai</dd>
            </div>
            <div className="info-row">
              <Icon name="Message" size={16} />
              <dt className="t-p-h5">Pertanyaan</dt>
              <dd className="t-p-h4-bold">
                {state.questions.filter((q) => q.state === "dibacakan" || q.state === "dijawab").length} dijawab dari {state.questions.length}
              </dd>
            </div>
            <div className="info-row">
              <Icon name="Megaphone" size={16} />
              <dt className="t-p-h5">Pengumuman</dt>
              <dd className="t-p-h4-bold">{state.announcements.length} terkirim</dd>
            </div>
          </dl>
          <span className="t-p-h5 stage-muted">Link MC berhenti berlaku besok. Terima kasih sudah memandu House Moving Day!</span>
        </StageCard>
      )}

      {live && speaker && (
        <StageCard icon="Send" tone="sky" title={`Kode ke ${firstName(speaker.name)}`} aside={sent ? <Badge type="neutral" icon="Check">Terkirim</Badge> : undefined}>
          <span className="t-p-h5 stage-muted">Muncul besar di layar pembicara, jadi kamu tidak perlu memberi isyarat dari jauh.</span>
          <div className="signal-grid">
            {(["5-menit", "tanya-jawab", "akhiri", "terima-kasih"] as McSignal[]).map((k) => (
              <button key={k} type="button" className={`signal-btn clay clay-light${sent?.kind === k ? " is-sent" : ""}`} onClick={() => onSignal(k)}>
                <Icon name={MC_SIGNALS[k].icon} size={20} />
                <span className="t-p-h4-bold">{MC_SIGNALS[k].title}</span>
              </button>
            ))}
          </div>
        </StageCard>
      )}

      {focus && script.length > 0 && !ended && (
        <StageCard
          icon="Pencil"
          tone="ink"
          title={`Naskah · ${focus.title}`}
          aside={
            <span className="claude-tag t-p-h5-bold">
              <Icon name="Sparkle" size={16} />
              Claude
            </span>
          }
        >
          <ol className="script">
            {script.map((line, i) => {
              const done = checked.includes(i);
              return (
                <li key={i} className={`script__item${done ? " is-done" : ""}`}>
                  <button type="button" role="checkbox" aria-checked={done} aria-label={`Tandai ${line.label}`} className={`st-check${done ? " is-on clay clay-accent" : ""}`} onClick={() => onToggleLine(focus.id, i)}>
                    {done && <Icon name="Check" size={16} />}
                  </button>
                  <span className="script__text">
                    <span className="t-p-h5-bold script__label">{line.label}</span>
                    <p className="t-p-h4 script__line">{line.text}</p>
                  </span>
                </li>
              );
            })}
          </ol>
          {(SCRIPTS[focus.id]?.length ?? 0) > 1 && (
            <Button size="small" style="tertiary" icon="Sparkle" onClick={() => onVariant(focus.id)}>
              Saran lain
            </Button>
          )}
          <span className="t-p-h5 stage-muted">Disusun Claude dari rundown. Panitia bisa mengubahnya di dashboard.</span>
        </StageCard>
      )}

      {confirmEnd && live && (
        <Dialog
          icon="Check"
          iconTone="green"
          title={`Selesaikan ${live.title}?`}
          description={`Tamu langsung dapat form feedback sesi ini.${next ? ` Setelah itu kamu bisa mulai ${next.title}.` : " Ini sesi terakhir, acara akan ditandai selesai."}`}
          onClose={() => setConfirmEnd(false)}
          actions={
            <>
              <Button
                icon="Check"
                onClick={() => {
                  setConfirmEnd(false);
                  onEnd();
                }}
              >
                Selesaikan
              </Button>
              <Button style="tertiary" onClick={() => setConfirmEnd(false)}>
                Kembali
              </Button>
            </>
          }
        />
      )}
    </>
  );
}

function RundownList({ state }: { state: StageState }) {
  const next = nextSession(state);
  return (
    <ol className="rd-list">
      {sortedSessions().map((s) => {
        const st = state.doneIds.includes(s.id) ? "done" : s.id === state.liveId ? "now" : s.id === next?.id ? "next" : "later";
        const sp = personById(s.speakerId);
        return (
          <li key={s.id} className={`rd-item is-${st}`}>
            <span className="t-p-h5-bold rd-item__time">{formatTime(s.start)}</span>
            <span className="rd-item__body">
              <span className="t-p-h4-bold one-line">{s.title}</span>
              <span className="t-p-h5 stage-muted one-line">
                {roomName(s.roomId)} · PIC {s.pic}
                {sp ? ` · ${sp.name}` : ""}
              </span>
              {st === "now" && <Badge type="now">Sekarang</Badge>}
              {st === "next" && <Badge type="next" icon="Clock">Berikutnya</Badge>}
              {st === "done" && <Badge type="done">Selesai</Badge>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Pertanyaan ---------------- */

const DONE: StageQuestionState[] = ["dibacakan", "dijawab", "dilewati"];

function Pertanyaan({ state, onSet, onRead }: { state: StageState; onSet: (id: string, s: StageQuestionState) => void; onRead: () => void }) {
  const [view, setView] = useState<"masuk" | "dipilih" | "selesai">("masuk");
  const sessionId = state.liveId ?? "talkshow";
  const session = sessionById(sessionId);
  const all = state.questions.filter((q) => q.sessionId === sessionId);
  const inbox = all.filter((q) => q.state === "masuk");
  const picked = all.filter((q) => q.state === "dipilih");
  const done = all.filter((q) => DONE.includes(q.state));
  const counts = { masuk: inbox.length, dipilih: picked.length, selesai: done.length };
  const doneTag = (q: StageQuestion) =>
    q.state === "dilewati" ? <Badge type="done">Dilewati</Badge> : <Badge type="answered">{q.state === "dijawab" ? "Dijawab pembicara" : "Dibacakan"}</Badge>;

  return (
    <>
      <header className="stage-head">
        <div className="stage-head__text">
          <h1 className="t-display-h6 stage-head__title">Pertanyaan</h1>
          <p className="t-p-h5 stage-head__sub">
            {session.title} · {all.length} masuk dari tamu
          </p>
        </div>
      </header>

      <div className="st-tabs" role="tablist">
        {(["masuk", "dipilih", "selesai"] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} className={`st-tab t-p-h5-bold${view === v ? " is-active clay clay-dark" : " clay clay-light"}`} onClick={() => setView(v)}>
            {v === "masuk" ? "Masuk" : v === "dipilih" ? "Dipilih" : "Selesai"}
            <span className="st-tab__count">{counts[v]}</span>
          </button>
        ))}
      </div>

      {view === "masuk" &&
        (inbox.length === 0 ? (
          <EmptyCard icon="Message" title="Belum ada pertanyaan baru" body={session.qna ? "Pertanyaan dari HP tamu muncul di sini, langsung dikelompokkan per topik." : "Sesi ini tidak membuka tanya jawab."} />
        ) : (
          <>
            <span className="q-hint">
              <span className="claude-tag t-p-h5-bold">
                <Icon name="Sparkle" size={16} />
                Dikelompokkan Claude
              </span>
              <span className="t-p-h5 stage-muted">Geser kanan untuk pilih, kiri untuk lewati.</span>
            </span>
            {QUESTION_GROUPS.map((g) => {
              const list = inbox.filter((q) => q.groupId === g.id).sort((a, b) => a.at - b.at);
              if (!list.length) return null;
              return (
                <section key={g.id} className="q-group">
                  <div className="q-group__head">
                    <span className="t-p-h4-bold q-group__title">{g.label}</span>
                    <Badge type="neutral">{list.length} pertanyaan</Badge>
                  </div>
                  <ul className="q-list">
                    {list.map((q) => (
                      <QCard key={q.id} q={q} primary={{ label: "Pilih", icon: "Check", onClick: () => onSet(q.id, "dipilih") }} secondary={{ label: "Lewati", onClick: () => onSet(q.id, "dilewati") }} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </>
        ))}

      {view === "dipilih" && picked.length > 0 && (
        <Button block icon="Eye" onClick={onRead}>
          Mode baca · {picked.length} pertanyaan
        </Button>
      )}
      {view === "dipilih" &&
        (picked.length === 0 ? (
          <EmptyCard icon="Check" title="Belum ada yang dipilih" body="Pilih pertanyaan dari tab Masuk. Yang dipilih juga tampil di layar pembicara." />
        ) : (
          <ul className="q-list">
            {picked.map((q) => (
              <QCard
                key={q.id}
                q={q}
                picked
                tag={<Badge type="read">Tamu melihat: Dibaca</Badge>}
                primary={{ label: "Dibacakan", icon: "Check", onClick: () => onSet(q.id, "dibacakan") }}
                secondary={{ label: "Batal pilih", onClick: () => onSet(q.id, "masuk") }}
              />
            ))}
          </ul>
        ))}

      {view === "selesai" &&
        (done.length === 0 ? (
          <EmptyCard icon="Message" title="Belum ada yang selesai" body="Pertanyaan yang sudah dibacakan atau dilewati pindah ke sini." />
        ) : (
          <ul className="q-list">
            {done.map((q) => (
              <QCard key={q.id} q={q} tag={doneTag(q)} />
            ))}
          </ul>
        ))}
    </>
  );
}

function EmptyCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <section className="stage-card">
      <div className="stage-card__body" style={{ alignItems: "center", textAlign: "center", padding: "var(--padding-extra-large) var(--padding-large)" }}>
        <span className="icon-badge icon-badge--pink icon-badge--L clay clay-accent">
          <Icon name={icon} size={28} />
        </span>
        <span className="t-p-h4-bold">{title}</span>
        <span className="t-p-h5 stage-muted">{body}</span>
      </div>
    </section>
  );
}

/* ---------------- Sorotan ---------------- */

const SAY = [
  "Selamat datang Laras dan Dimas yang baru sampai! Langsung cek HP kalian ya, karakternya sudah menunggu.",
  "Tepuk tangan buat Bayu yang sudah kumpulkan 5 kartu kenalan! Siapa berikutnya?",
  "Yang belum dapat kenalan, sekarang momen yang pas. Tinggal scan QR teman di sebelah kalian.",
];

function Sorotan({ state, onCopied }: { state: StageState; onCopied: () => void }) {
  const [i, setI] = useState(0);
  const here = ADMIN_GUESTS.filter((g) => g.checkIn !== null && g.hadir);
  const yes = ADMIN_GUESTS.filter((g) => g.rsvp === "ya").length;
  const recent = [...here].sort((a, b) => (b.checkIn ?? 0) - (a.checkIn ?? 0)).slice(0, 4);
  const rewards = ADMIN_GUESTS.filter((g) => g.reward !== "mengumpulkan").slice(0, 3);
  const fb = SAMPLE_EVENT_FEEDBACK.pembukaan;
  const avg = fb.reduce((a, b) => a + b.rating, 0) / fb.length;
  const copy = () => {
    navigator.clipboard?.writeText(SAY[i]).catch(() => undefined);
    onCopied();
  };

  return (
    <>
      <header className="stage-head">
        <div className="stage-head__text">
          <h1 className="t-display-h6 stage-head__title">Sorotan</h1>
          <p className="t-p-h5 stage-head__sub">Bahan sapaan dari yang terjadi di acara.</p>
        </div>
      </header>

      <div className="mini-stats">
        <div className="mini-stat">
          <span className="t-p-h5 stage-muted">Hadir</span>
          <span className="mini-stat__value">{here.length}</span>
          <span className="t-p-h5 stage-muted">dari {yes}</span>
        </div>
        <div className="mini-stat">
          <span className="t-p-h5 stage-muted">Hadiah</span>
          <span className="mini-stat__value">{rewards.length + 2}</span>
          <span className="t-p-h5 stage-muted">kartu lengkap</span>
        </div>
        <div className="mini-stat">
          <span className="t-p-h5 stage-muted">Rating</span>
          <span className="mini-stat__value">{avg.toFixed(1).replace(".", ",")}</span>
          <span className="t-p-h5 stage-muted">Pembukaan</span>
        </div>
      </div>

      <StageCard
        icon="Sparkle"
        tone="green"
        title="Sapaan siap baca"
        aside={
          <span className="claude-tag t-p-h5-bold">
            <Icon name="Sparkle" size={16} />
            Claude
          </span>
        }
      >
        <div className="say-box">
          <p className="say-box__line">“{SAY[i]}”</p>
        </div>
        <div className="q-card__actions">
          <Button size="small" style="tertiary" icon="Sparkle" onClick={() => setI((i + 1) % SAY.length)}>
            Saran lain
          </Button>
          <Button size="small" style="secondary" icon="Copy" onClick={copy}>
            Salin
          </Button>
        </div>
      </StageCard>

      <StageCard icon="Users" tone="green" title="Baru datang">
        <ul className="hl-list">
          {recent.map((g) => (
            <li key={g.id} className="hl-item">
              <Avatar initial={g.name.charAt(0)} size="S" />
              <span className="hl-item__text">
                <span className="t-p-h4-bold">{g.name}</span>
                <span className="t-p-h5 stage-muted">Hadir {formatTime(g.checkIn ?? 0)}</span>
              </span>
              <Badge type="claimed">Hadir</Badge>
            </li>
          ))}
        </ul>
      </StageCard>

      <StageCard icon="Gift" tone="amber" title="Kartu kenalan lengkap">
        <ul className="hl-list">
          {rewards.map((g) => (
            <li key={g.id} className="hl-item">
              <Avatar initial={g.name.charAt(0)} size="S" />
              <span className="hl-item__text">
                <span className="t-p-h4-bold">{g.name}</span>
                <span className="t-p-h5 stage-muted">5/5 kartu kenalan</span>
              </span>
              <Badge type={g.reward === "diambil" ? "claimed" : "ready"}>{g.reward === "diambil" ? "Diambil" : "Siap"}</Badge>
            </li>
          ))}
        </ul>
      </StageCard>
      {state.phase === "ended" && <span className="t-p-h5 stage-muted">Feedback akhir sedang masuk. Hasil lengkapnya ada di dashboard panitia.</span>}
    </>
  );
}

/* ---------------- Umumkan ---------------- */

function Umumkan({ state, compose: startCompose, onSend }: { state: StageState; compose: boolean; onSend: (a: { title: string; body: string; roomId: string | null }) => void }) {
  const [confirm, setConfirm] = useState<{ title: string; body: string; roomId: string | null } | null>(null);
  const [compose, setCompose] = useState(startCompose);
  const [title, setTitle] = useState(startCompose ? "Foto bersama 5 menit lagi" : "");
  const [body, setBody] = useState(startCompose ? "Kumpul di Halaman Depan ya!" : "");
  const [roomId, setRoomId] = useState<string | null>(startCompose ? "halaman-depan" : null);
  const here = ADMIN_GUESTS.filter((g) => g.checkIn !== null && g.hadir).length;

  return (
    <>
      <header className="stage-head">
        <div className="stage-head__text">
          <h1 className="t-display-h6 stage-head__title">Umumkan</h1>
          <p className="t-p-h5 stage-head__sub">Muncul sebagai notifikasi di HP {here} tamu yang hadir.</p>
        </div>
      </header>

      <StageCard icon="Megaphone" tone="coral" title="Sekali ketuk">
        <div className="tpl-list">
          {ANNOUNCE_TEMPLATES.map((t) => (
            <button key={t.title} type="button" className="tpl clay clay-light" onClick={() => setConfirm(t)}>
              <span className="icon-badge icon-badge--coral icon-badge--S clay clay-accent">
                <Icon name={t.icon} size={16} />
              </span>
              <span className="tpl__text">
                <span className="t-p-h4-bold one-line">{t.title}</span>
                <span className="t-p-h5 stage-muted one-line">{t.body}</span>
              </span>
              <Icon name="ChevronRight" size={20} />
            </button>
          ))}
        </div>
      </StageCard>

      <StageCard icon="Pencil" tone="coral" title="Tulis sendiri">
        {compose ? (
          <>
            <TextField label="Judul" value={title} onChange={setTitle} placeholder="Foto bersama 5 menit lagi" maxLength={40} hint={`${title.length}/40`} />
            <TextField label="Isi" value={body} onChange={setBody} placeholder="Kumpul di Halaman Depan ya!" multiline maxLength={120} hint={`${body.length}/120`} />
            <RoomPicker label="Ruangan tujuan (opsional)" value={roomId} onChange={setRoomId} optional hint="Kalau dipilih, notifikasinya punya tombol “Ke sana”." />
            <Button block icon="Megaphone" disabled={!title.trim() || !body.trim()} onClick={() => setConfirm({ title: title.trim(), body: body.trim(), roomId })}>
              Kirim ke {here} tamu
            </Button>
          </>
        ) : (
          <Button block style="tertiary" icon="Plus" onClick={() => setCompose(true)}>
            Tulis pengumuman
          </Button>
        )}
      </StageCard>

      {state.announcements.length > 0 && (
        <StageCard icon="Clock" tone="slate" title="Sudah dikirim">
          <ul className="hl-list">
            {[...state.announcements].reverse().map((a, i) => (
              <li key={i} className="hl-item">
                <Icon name="Megaphone" size={20} />
                <span className="hl-item__text">
                  <span className="t-p-h4-bold one-line">{a.title}</span>
                  <span className="t-p-h5 stage-muted one-line">
                    {formatTime(a.at)} · {a.roomId ? roomName(a.roomId) : "Tanpa tombol Ke sana"}
                  </span>
                </span>
                <Badge type="read">Terkirim</Badge>
              </li>
            ))}
          </ul>
        </StageCard>
      )}

      {confirm && (
        <Dialog
          icon="Megaphone"
          iconTone="coral"
          title="Kirim pengumuman?"
          description={`Muncul di HP ${here} tamu. Tidak bisa ditarik setelah terkirim.`}
          onClose={() => setConfirm(null)}
          actions={
            <>
              <Button
                icon="Megaphone"
                onClick={() => {
                  onSend(confirm);
                  setConfirm(null);
                  setCompose(false);
                  setTitle("");
                  setBody("");
                  setRoomId(null);
                }}
              >
                Kirim sekarang
              </Button>
              <Button style="tertiary" onClick={() => setConfirm(null)}>
                Kembali
              </Button>
            </>
          }
        >
          <span className="say-box" style={{ textAlign: "left" }}>
            <span className="t-p-h4-bold">{confirm.title}</span>
            <span className="t-p-h5 stage-muted">
              {confirm.body}
              {confirm.roomId ? ` · tombol Ke sana: ${roomName(confirm.roomId)}` : ""}
            </span>
          </span>
        </Dialog>
      )}
    </>
  );
}
