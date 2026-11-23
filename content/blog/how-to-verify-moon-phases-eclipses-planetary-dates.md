---
title: How to Verify Moon Phases, Eclipses and Planetary Dates
description: A practical source-first method for checking sky-event dates, local time zones, eclipse visibility and planetary stations before trusting an astrology calendar.
date: 2026-11-23
updated: 2026-11-23
author: Hedi Touati
category: Astronomy & Astrology
tags: [Astronomy, Moon Phases, Eclipses, Ephemeris, Research Methods]
image: /og-image.jpg
showImage: false
toc: true
draft: false
---

A date in an astrology calendar can look precise and still be wrong for your location. A new Moon may occur late on one civil date in London and after midnight on the next date in Tunis. An eclipse can happen at a precise global moment but be invisible from a particular city. A planet described as “retrograde” is not physically reversing its orbit; it is changing apparent direction against the background stars as seen from Earth.

Those distinctions matter. This guide gives you a repeatable way to check a sky-event date before you put it in a calendar, article or personal chart notes. It also explains what a source can verify—and what it cannot.

:::tldr Quick method
1. Identify the exact event: a lunar phase, eclipse contact, planetary station or sign ingress.
2. Find a primary astronomical source for the event time or coordinates.
3. Record the time standard (usually UTC) before converting it to local civil time.
4. For an eclipse, check the visibility path separately from the global event time.
5. Keep astronomical facts separate from the symbolic meaning an astrological tradition assigns to them.
:::

<!-- toc -->

## First, define the event precisely

“Full Moon,” “eclipse,” and “retrograde” are not interchangeable calendar labels. Before checking a date, write down exactly what you mean.

- **New or full Moon:** the instant of astronomical conjunction or opposition in ecliptic longitude, commonly called syzygy. It is one global instant; local calendar dates can differ.
- **Solar or lunar eclipse:** an alignment that meets the geometric conditions for an eclipse. The global event time does not tell you whether it is visible from your location.
- **Planetary station:** the moment a planet's apparent geocentric ecliptic longitude changes from increasing to decreasing (station retrograde), or from decreasing to increasing (station direct).
- **Sign ingress:** the moment a planet's apparent ecliptic longitude crosses a chosen zodiac boundary. The result depends on the zodiac convention and calculation settings.

A page that says only “the eclipse is on 17 February” leaves important questions unanswered: at what time, in which time zone, and visible where?

## Use sources that match the question

No single website is the best source for every kind of sky event. Choose the reference according to the fact you need to verify.

### Lunar phases

The United States Naval Observatory (USNO) publishes phase dates and times. Its data is useful for checking the instant of a new or full Moon. Start with the [USNO phases of the Moon service](https://aa.usno.navy.mil/data/MoonPhases).

When comparing two calendars, check whether both show UTC or local time. If one source displays UTC and another displays your local time, a one-day difference around midnight may be a time-zone conversion—not an astronomical disagreement.

### Solar and lunar eclipses

NASA's eclipse resources provide global circumstances, maps and event details. Use the [NASA Eclipse Web Site](https://eclipse.gsfc.nasa.gov/eclipse.html) to identify the event and then inspect its path or visibility information.

Do not infer local visibility from the event's headline date. A partial eclipse may be visible in one region and completely below the horizon in another. The local circumstances—start, maximum and end, where applicable—are the details a local observer needs.

### Planetary positions and stations

For planetary positions, use a documented ephemeris rather than relying only on a calendar graphic. The [Swiss Ephemeris documentation](https://www.astro.com/swisseph/swephinfo_e.htm) describes the astronomical calculation library and its supported settings.

When comparing station dates, keep the settings consistent: the planet, date range, time scale, geocentric or topocentric viewpoint, and zodiac convention. A source using a different coordinate frame or zodiac setting may report a different sign label even when the underlying sky position is the same.

## Convert UTC to local time carefully

The safest workflow is to preserve the source's original time before converting it.

1. Copy the event's date and time exactly as published.
2. Confirm whether the source labels it UTC, UT, TT or local time. Do not silently treat these as identical.
3. Convert the time to the location's civil time using the applicable time-zone rules for that date.
4. Check whether the converted time crosses midnight. If it does, the local calendar date changes.
5. Record the location or time zone beside the result.

For example, an event at 23:30 UTC on a given date may fall after midnight in a location several hours east of Greenwich. Both dates can be correct because they describe the same instant using different civil calendars.

Daylight-saving rules also matter. Do not apply today's UTC offset to an event in another month or year. Use the location's offset on the event date.

## A worked checking example

Imagine a calendar lists a full Moon as occurring on 24 November at 00:15 UTC.

A reader in a location using UTC+1 would see that instant at 01:15 on 24 November. A reader in a location using UTC−5 would see it at 19:15 on 23 November. The Moon reaches the same astronomical phase at one instant; the local date differs.

This is why a useful event listing should show both the reference time and the intended local time zone. If a page gives a local date without naming the location or time zone, you cannot reliably compare it with another calendar.

## What to record in an event table

A useful event table should make the underlying claim reproducible. Include the following fields when they apply:

| Field | What it tells the reader |
|---|---|
| Event name | The specific phase, eclipse, station or ingress |
| Exact event time | The instant, not just a calendar day |
| Time standard | UTC, UT, TT or named local time zone |
| Local conversion | The city or time zone used for the displayed date |
| Visibility | Whether the event can be observed from the stated region |
| Calculation settings | Source, coordinate frame and zodiac convention where relevant |
| Checked date | When the page's facts were last checked |
| Source link | A direct reference that readers can inspect |

For an eclipse, add the local circumstances and the type of eclipse visible at the location. For a planetary station, identify whether the time refers to the retrograde or direct station. For a zodiac ingress, state whether the page uses the tropical or sidereal zodiac.

## Astronomy and astrology answer different questions

Astronomy can establish a calculated event time, a planet's apparent position, or the geographic region from which an eclipse is visible. Those are measurable claims that can be checked against published data.

Astrology adds a symbolic interpretive framework to those positions. Different schools may assign different meanings to the same event, and those meanings are not established astronomical findings. A calendar can accurately state when a planet appears to station retrograde without proving that the station causes a particular event in someone's life.

Prophetic treats these as separate layers: event data should be sourced and time-stamped; astrological interpretation should be identified as interpretation. Readers should not use astrology as a substitute for medical, financial, legal or safety advice.

## Common errors when comparing calendars

- **Comparing UTC with local time:** this is the most common reason for a one-day difference near midnight.
- **Confusing an eclipse date with local visibility:** the global event can occur while the Sun or Moon is below the horizon for a reader.
- **Leaving the zodiac convention unstated:** tropical and sidereal sign labels are not interchangeable.
- **Treating a station as a physical reversal:** retrograde motion is an apparent change in direction from Earth's viewpoint.
- **Relying on a graphic without a source:** attractive artwork is not evidence for an exact time.
- **Changing settings between checks:** geocentric and topocentric positions, or different time standards, can produce different displayed values.

If two sources disagree, do not choose the one that matches your expectation. First compare their definitions, time standards, location and calculation settings. Only then decide whether a real discrepancy remains.

## A reader's five-minute verification checklist

Before relying on a date, ask:

- [ ] Have I identified the exact astronomical event?
- [ ] Does the source provide an exact time, not only a date?
- [ ] Do I know which time standard the source uses?
- [ ] Have I converted it using the correct time zone for the event date?
- [ ] If it is an eclipse, have I checked local visibility?
- [ ] If it is a sign ingress, have I identified the zodiac convention?
- [ ] Can I open the source and reproduce the information?

If you cannot answer one of these questions, label the detail as unverified rather than filling the gap with an estimate.

## Sources and further reading

- [United States Naval Observatory — Phases of the Moon](https://aa.usno.navy.mil/data/MoonPhases): phase dates and times.
- [NASA — Eclipse Web Site](https://eclipse.gsfc.nasa.gov/eclipse.html): eclipse catalogs, maps and circumstances.
- [Astrodienst — Swiss Ephemeris documentation](https://www.astro.com/swisseph/swephinfo_e.htm): ephemeris software documentation and calculation settings.
- [Astro.com — Introduction to Hellenistic Astrology: Annual Profections, Lots and Zodiacal Releasing](https://www.astro.com/astrology/tma_article190314_e.htm): historical context for annual profections as an astrological timing technique.

These references support different parts of the workflow; none should be treated as a source for every claim on every page. Always follow the source that matches the specific event and calculation you are checking.

## How to report a correction

If you find a date, time zone or source mismatch in a Prophetic guide, send the page address, the disputed statement and the reference you believe corrects it through the [contact page](/contact/). A useful correction includes enough information for another reader to reproduce the comparison.

The standard is straightforward: show the event, show the source, state the time zone and explain what remains interpretive. Precision is only useful when readers can check where it came from.
