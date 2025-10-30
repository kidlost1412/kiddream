/**
 * Custom hook for calendar layout logic
 * Handles interval partitioning algorithm for overlapping events
 */

import { useMemo } from 'react';
import type { Todo } from '../../../../types';
import { timeToMinutes } from '../../../../utils/dateHelpers';

type Interval = { todo: Todo; start: number; end: number };
type Placed = Interval & { left: number; width: number };

/**
 * Advanced layout algorithm using interval partitioning
 * Time complexity: O(n log n) where n is number of events
 *
 * Algorithm:
 * 1. Sort events by start time
 * 2. Group overlapping events into clusters
 * 3. For each cluster, assign lanes using greedy algorithm
 * 4. Calculate positioning (left%, width%) for each event
 */
export function useCalendarLayout() {
  const layoutDay = useMemo(() => (items: Todo[]): Placed[] => {
    if (items.length === 0) return [];

    // Map to intervals and sort by start time (O(n log n))
    const intervals: Interval[] = items
      .filter(t => t.startTime && t.endTime)
      .map(t => ({
        todo: t,
        start: timeToMinutes(t.startTime!),
        end: timeToMinutes(t.endTime!)
      }))
      .sort((a, b) => a.start - b.start || a.end - b.end);

    const placed: Placed[] = [];
    let i = 0;

    // Process clusters of overlapping events
    while (i < intervals.length) {
      const clusterStart = i;
      let clusterEndMax = intervals[i].end;
      let j = i + 1;

      // Find all events that overlap with this cluster
      while (j < intervals.length && intervals[j].start < clusterEndMax) {
        clusterEndMax = Math.max(clusterEndMax, intervals[j].end);
        j++;
      }

      // Process cluster [clusterStart, j)
      const cluster = intervals.slice(clusterStart, j);

      // Assign lanes using greedy interval partitioning
      const laneEnds: number[] = [];
      const laneIndex: number[] = new Array(cluster.length).fill(0);

      for (let k = 0; k < cluster.length; k++) {
        const event = cluster[k];
        let assignedLane = -1;

        // Find first available lane
        for (let lane = 0; lane < laneEnds.length; lane++) {
          if (laneEnds[lane] <= event.start) {
            assignedLane = lane;
            break;
          }
        }

        // Create new lane if needed
        if (assignedLane === -1) {
          assignedLane = laneEnds.length;
          laneEnds.push(event.end);
        } else {
          laneEnds[assignedLane] = event.end;
        }

        laneIndex[k] = assignedLane;
      }

      const totalLanes = laneEnds.length;

      // Calculate positioning for each event in cluster
      for (let k = 0; k < cluster.length; k++) {
        const event = cluster[k];
        placed.push({
          ...event,
          left: (laneIndex[k] * 100) / totalLanes,
          width: 100 / totalLanes
        });
      }

      i = j;
    }

    return placed;
  }, []);

  return { layoutDay };
}
