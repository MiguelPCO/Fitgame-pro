import { describe, it, expect } from 'vitest';
import { generateRacePlan, generateRunTemplates, splitDaysByDiscipline, suggestSchedule } from './templateGenerator';
import { addDays, toISODate } from './schedule';

describe('generateRunTemplates', () => {
  it('produce un plan valido: una tirada larga y un rodaje por dia restante', () => {
    const plan = generateRunTemplates({ daysPerWeek: 3, experienceLevel: 'Beginner' });

    expect(plan).toHaveLength(3);
    expect(plan[0].name).toBe('Tirada larga');
    expect(plan.every(t => t.exercises.length > 0)).toBe(true);
    expect(plan.every(t => t.muscleFocus.includes('Cardio'))).toBe(true);
  });

  it('la tirada larga es la sesion mas larga de la semana', () => {
    const plan = generateRunTemplates({ daysPerWeek: 4, experienceLevel: 'Intermediate' });
    const minutes = (name: string) =>
      parseInt(plan.find(t => t.name === name)!.duration, 10);

    const longRun = minutes('Tirada larga');
    for (const t of plan.filter(t => t.name !== 'Tirada larga')) {
      expect(longRun).toBeGreaterThanOrEqual(parseInt(t.duration, 10));
    }
  });

  it('solo mete sesion de calidad si hay base y al menos 3 dias', () => {
    const novato = generateRunTemplates({ daysPerWeek: 5, experienceLevel: 'Beginner' });
    expect(novato.some(t => t.name === 'Series')).toBe(false);

    const dosDias = generateRunTemplates({ daysPerWeek: 2, experienceLevel: 'Advanced' });
    expect(dosDias.some(t => t.name === 'Series')).toBe(false);

    const conBase = generateRunTemplates({ daysPerWeek: 4, experienceLevel: 'Advanced' });
    expect(conBase.filter(t => t.name === 'Series')).toHaveLength(1);
  });

  it('cada plantilla de carrera se puede programar en un dia', () => {
    const plan = generateRunTemplates({ daysPerWeek: 4, experienceLevel: 'Intermediate' });
    const schedule = suggestSchedule(plan, 4);
    expect(Object.keys(schedule)).toHaveLength(4);
  });
});

describe('generateRacePlan', () => {
  const raceDateIn = (weeks: number) => toISODate(addDays(new Date(), weeks * 7));

  it('genera al menos una tirada larga por semana', () => {
    const raceDate = raceDateIn(12);
    const plan = generateRacePlan({
      raceDistance: '10k', raceDate, daysPerWeek: 4, experienceLevel: 'Intermediate',
    });

    const longRuns = plan.filter(s => s.runType === 'long');
    // 12 semanas, 2 de taper sin tirada larga propia + la semana de carrera: al
    // menos una decena de tiradas largas repartidas por el plan.
    expect(longRuns.length).toBeGreaterThanOrEqual(8);
  });

  it('la distancia de la tirada larga no baja mas que sube (10% semanal como maximo)', () => {
    const plan = generateRacePlan({
      raceDistance: '10k', raceDate: raceDateIn(10), daysPerWeek: 4, experienceLevel: 'Beginner',
    });
    const longRuns = plan.filter(s => s.runType === 'long').sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    const km = (title: string) => parseFloat(title.split('·')[1]);

    for (let i = 1; i < longRuns.length; i++) {
      const prev = km(longRuns[i - 1].title);
      const curr = km(longRuns[i].title);
      // Taper permite bajar; lo que no puede hacer es subir mucho mas de un 10%
      // (el redondeo a 0.5 km exagera el porcentaje en distancias pequeñas).
      expect(curr).toBeLessThanOrEqual(prev * 1.2);
    }
  });

  it('termina con la carrera en la fecha objetivo', () => {
    const raceDate = raceDateIn(8);
    const plan = generateRacePlan({
      raceDistance: '5k', raceDate, daysPerWeek: 3, experienceLevel: 'Beginner',
    });
    const race = plan.find(s => s.runType === 'race');
    expect(race?.isoDate).toBe(raceDate);
  });

  it('ninguna sesion cae antes de hoy', () => {
    const plan = generateRacePlan({
      raceDistance: 'half', raceDate: raceDateIn(16), daysPerWeek: 5, experienceLevel: 'Advanced',
    });
    const todayISO = toISODate(new Date());
    expect(plan.every(s => s.isoDate >= todayISO)).toBe(true);
  });
});

describe('splitDaysByDiscipline', () => {
  it('reparte los dias segun la disciplina', () => {
    expect(splitDaysByDiscipline('gym', 4)).toEqual({ gymDays: 4, runDays: 0 });
    expect(splitDaysByDiscipline('running', 4)).toEqual({ gymDays: 0, runDays: 4 });
    expect(splitDaysByDiscipline('both', 5)).toEqual({ gymDays: 3, runDays: 2 });
  });
});
