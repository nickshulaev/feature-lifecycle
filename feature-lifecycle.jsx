import { useState, useMemo } from "react";

const ROLES = {
  PM: { label: "PM", color: "#3B82F6", bg: "#EFF6FF" },
  DEV: { label: "Dev Lead / Senior", color: "#10B981", bg: "#ECFDF5" },
  QA: { label: "QA", color: "#F59E0B", bg: "#FFFBEB" },
  DESIGN: { label: "Design", color: "#EC4899", bg: "#FDF2F8" },
  DEVOPS: { label: "DevOps", color: "#8B5CF6", bg: "#F5F3FF" },
  PRODUCT: { label: "Product Owner", color: "#EF4444", bg: "#FEF2F2" },
  SUPPORT: { label: "Support", color: "#06B6D4", bg: "#ECFEFF" },
};

const FULL_CYCLE_STAGES = [
  {
    id: "discovery",
    name: "Discovery & Prioritization",
    owner: ["PRODUCT"],
    participants: ["PM"],
    track: "full",
    description: "Формулировка гипотезы, ICE-скоринг, приоритизация на Product Committee.",
    artifacts: ["Hypothesis Card", "ICE Score", "Priority Decision"],
    checklist: {
      PRODUCT: [
        "Проблема описана в формате JTBD",
        "Гипотеза сформулирована (If... Then... Because...)",
        "ICE-скоринг проведен",
        "Целевая метрика определена",
        "Решение вынесено на Priority meeting",
      ],
      PM: [
        "Операционные ограничения учтены",
        "Зависимости от других команд/сервисов идентифицированы",
      ],
    },
  },
  {
    id: "feature-spec",
    name: "Feature Specification",
    owner: ["PRODUCT", "PM"],
    participants: ["DEV"],
    track: "full",
    description: "Детальное описание фичи: проблема, решение, метрики, критерии успеха, compliance-требования.",
    artifacts: ["Feature Spec Document", "Success Criteria", "Compliance Checklist"],
    checklist: {
      PRODUCT: [
        "Проблема, которую решаем -- описана",
        "Предлагаемое решение -- описано",
        "Метрики успеха определены (North Star + proxy)",
        "Критерии приемки сформулированы",
        "Ссылки на исследования / инсайты приложены",
      ],
      PM: [
        "Compliance-требования проверены",
        "Влияние на приложение ТН оценено (TN Impact Assessment)",
        "Зависимости от бэкенда банка / АБС описаны",
        "Feature flag стратегия определена (нужен / не нужен, план раскатки)",
      ],
      DEV: [
        "Техническая feasibility подтверждена на высоком уровне",
      ],
    },
  },
  {
    id: "design",
    name: "UX/UI Design",
    owner: ["DESIGN"],
    participants: ["PM", "QA"],
    track: "full",
    description: "Дизайн в Figma. QA подключается для ревью corner cases на этапе дизайна.",
    artifacts: ["Figma Mockups", "User Flows", "QA Corner Cases Document"],
    checklist: {
      DESIGN: [
        "User flow отрисован",
        "UI-макеты готовы (все состояния: loading, empty, error, success)",
        "Edge cases отрисованы (null-значения, длинные строки, оффлайн)",
        "Макеты для Sky Bank адаптированы (если применимо)",
        "Ссылка на Figma актуальна и расшарена",
      ],
      QA: [
        "Corner cases проревьюены на этапе дизайна",
        "Тест-кейсы написаны (черновик) по макетам",
        "Тестовые данные определены",
        "Особенности тестирования зафиксированы",
      ],
      PM: [
        "Макеты соответствуют спецификации",
        "Тест-кейсы QA проревьюены PM",
      ],
    },
  },
  {
    id: "presentation",
    name: "Presentation Meeting",
    owner: ["PM"],
    participants: ["PRODUCT", "DEV", "QA", "DESIGN"],
    track: "full",
    description: "Презентация фичи команде. Обсуждение MVP scope, технических рисков, зависимостей.",
    artifacts: ["Meeting Notes", "MVP/MLP Description", "Risk Register"],
    checklist: {
      PM: [
        "Встреча назначена, все участники приглашены",
        "Feature spec + макеты презентованы",
        "MVP scope согласован",
        "Технические риски зафиксированы",
        "Зависимости от ТН обсуждены",
        "Compliance-вопросы подняты",
      ],
      DEV: [
        "Архитектурные вопросы подняты",
        "Spike-задачи идентифицированы (если нужны)",
        "Предварительная оценка трудозатрат озвучена",
      ],
      QA: [
        "Тестовая стратегия озвучена",
        "Ограничения тестовых сред подняты",
      ],
    },
  },
  {
    id: "tech-doc",
    name: "Technical Documentation",
    owner: ["DEV"],
    participants: ["PM", "QA"],
    track: "full",
    description: "Техническая декомпозиция. Владелец -- Tech Lead / Senior (роли SA нет). Диаграммы, API-контракты, задачи в Git.",
    artifacts: ["Technical Spec", "API Contracts", "Decomposed Tasks in Git", "Architecture Diagrams"],
    checklist: {
      DEV: [
        "Spike-задачи завершены (если были)",
        "Архитектурные диаграммы подготовлены",
        "API-контракты описаны (request/response, версионирование, null-обработка)",
        "Задачи декомпозированы и заведены в Git",
        "Каждая задача привязана к Epic",
        "Оценка трудозатрат по задачам готова",
        "Влияние на кодовую базу ТН оценено и задокументировано",
      ],
      PM: [
        "Epic в Git создан со всеми вложениями (ТЗ, Figma, тест-кейсы, схема)",
        "Шаблон задачи заполнен (feature flags, тестовые данные, параметры)",
      ],
      QA: [
        "Тест-кейсы финализированы",
        "Тестовые данные подготовлены",
        "Автотесты спланированы (если применимо)",
      ],
    },
  },
  {
    id: "handshake",
    name: "Handshake Meeting (DoR Gate)",
    owner: ["PM"],
    participants: ["PRODUCT", "DEV", "QA"],
    track: "full",
    gate: true,
    description: "Definition of Ready. Финальное подтверждение готовности к разработке. Без прохождения DoR -- задача не берется в спринт.",
    artifacts: ["Approved Scope", "DoR Checklist (signed off)"],
    checklist: {
      PM: [
        "Feature spec утверждена",
        "Макеты в Figma финальные и согласованы",
        "Тест-кейсы готовы и проревьюены",
        "Тестовые данные подготовлены",
        "Задачи в Git заведены и привязаны к Epic",
        "Feature flag стратегия утверждена",
        "Compliance-согласование получено (если нужно)",
        "Влияние на ТН оценено и согласовано",
        "Support handoff план готов",
        "Scope зафиксирован и подписан",
      ],
    },
  },
  {
    id: "sprint-planning",
    name: "Sprint Planning",
    owner: ["PM"],
    participants: ["DEV", "QA"],
    track: "full",
    description: "Планирование спринта. Только задачи, прошедшие DoR.",
    artifacts: ["Sprint Goal", "Sprint Backlog"],
    checklist: {
      PM: [
        "Sprint Goal сформулирован",
        "Задачи распределены по разработчикам",
        "Capacity команды учтен",
        "Зависимости между задачами выстроены",
      ],
      DEV: [
        "Задачи понятны, вопросов нет",
        "Оценки подтверждены",
      ],
      QA: [
        "QA-ресурсы распланированы",
        "Тестовые среды готовы",
      ],
    },
  },
  {
    id: "development",
    name: "Development",
    owner: ["DEV"],
    participants: ["PM", "QA"],
    track: "full",
    description: "Разработка. Daily stand-ups, code review, merge requests. Feature flag включен на DEV.",
    artifacts: ["Working Code", "Code Reviews", "Merge Requests"],
    checklist: {
      DEV: [
        "Код написан по спецификации",
        "Code review пройден (включая ревью от ТН если затрагивает общий код)",
        "Unit-тесты написаны",
        "Feature flag активирован на DEV-среде",
        "API-контракты соответствуют документации",
        "Merge request создан и аппрувнут",
      ],
      PM: [
        "Ежедневный статус актуален",
        "Блокеры эскалированы",
      ],
      QA: [
        "Smoke-тестирование на DEV пройдено",
        "Критические баги зарепорчены",
      ],
    },
  },
  {
    id: "qa-testing",
    name: "QA & Testing",
    owner: ["QA"],
    participants: ["DEV", "PM"],
    track: "full",
    description: "Полное тестирование. ~1 неделя на DEV, затем RC. PM ревьюит результаты.",
    artifacts: ["Test Report", "Bug Reports", "Regression Results"],
    checklist: {
      QA: [
        "Тест-кейсы выполнены (все из подготовленных на этапе дизайна)",
        "Регрессионное тестирование пройдено",
        "UI-тестирование выполнено (все состояния, edge cases)",
        "Баги заведены с приоритетами",
        "Критические баги устранены и перетестированы",
        "Тестирование на RC-среде пройдено",
        "Sky Bank -- протестировано (если применимо)",
      ],
      DEV: [
        "Все критические и major баги исправлены",
        "Фиксы прошли code review",
      ],
      PM: [
        "Результаты тестирования проревьюены",
        "Acceptance testing пройден лично",
        "Go/No-Go решение принято",
      ],
    },
  },
  {
    id: "support-handoff",
    name: "Support Handoff",
    owner: ["PM"],
    participants: ["SUPPORT"],
    track: "full",
    description: "Подготовка поддержки к релизу. Release notes, обновление скриптов, обучение.",
    artifacts: ["Support Release Notes", "Updated Scripts", "FAQ"],
    checklist: {
      PM: [
        "Release notes для поддержки подготовлены",
        "Скрипты ответов обновлены",
        "FAQ по новой фиче написан",
        "Команда поддержки уведомлена и обучена",
        "Контактное лицо для эскалации определено",
      ],
      SUPPORT: [
        "Release notes прочитаны",
        "Вопросы заданы до релиза",
        "Скрипты актуализированы в системе",
      ],
    },
  },
  {
    id: "release",
    name: "Release & Feature Flag Rollout",
    owner: ["DEVOPS"],
    participants: ["PM", "DEV", "QA"],
    track: "full",
    description: "Релиз в сторы. Постепенная раскатка через feature flags: RC → Prod (частично) → Prod (полностью).",
    artifacts: ["Release Build", "Release Notes", "Feature Flag Configuration"],
    checklist: {
      DEVOPS: [
        "Релиз собран и отправлен в сторы",
        "Release notes опубликованы",
        "Мониторинг настроен (crash rate, error rate)",
      ],
      PM: [
        "Feature flag раскатка по плану (Dev → RC → Prod 10% → Prod 100%)",
        "Критерии полной раскатки определены",
        "Rollback-план готов",
      ],
      QA: [
        "Smoke-тест на Prod после раскатки",
        "Мониторинг багов первые 24-48ч",
      ],
      DEV: [
        "Feature flag конфигурация корректна (iOS, Android, Web)",
        "Логирование событий работает",
      ],
    },
  },
  {
    id: "monitoring",
    name: "Post-Release Monitoring",
    owner: ["PM"],
    participants: ["DEV", "QA", "DEVOPS"],
    track: "full",
    description: "Мониторинг после релиза. Crash rate, ошибки, фидбек поддержки. Решение о полной раскатке / откате.",
    artifacts: ["Monitoring Dashboard", "Incident Reports"],
    checklist: {
      PM: [
        "Метрики мониторинга проверены (24ч / 48ч / 1 неделя)",
        "Фидбек от поддержки собран",
        "Решение: полная раскатка / откат / доработка",
        "Feature flag удален после стабилизации",
      ],
      DEV: [
        "Логи проверены на аномалии",
        "Performance не деградировал",
      ],
    },
  },
  {
    id: "dod-close",
    name: "Definition of Done & Close",
    owner: ["PM"],
    participants: ["PRODUCT", "DEV", "QA"],
    track: "full",
    gate: true,
    description: "Финальный гейт. Фича считается завершенной только после прохождения DoD.",
    artifacts: ["DoD Checklist (signed off)", "Retro Notes (optional)", "Demo Recording (optional)"],
    checklist: {
      PM: [
        "Фича работает на Prod для 100% пользователей",
        "Feature flag удален",
        "Все критические/major баги закрыты",
        "Метрики успеха начали трекаться",
        "Документация актуализирована",
        "Support handoff завершен",
        "Ретроспектива проведена (рекомендовано)",
        "Демо записано (рекомендовано)",
        "Epic в Git закрыт",
      ],
    },
  },
];

const FAST_TRACK_STAGES = [
  {
    id: "ft-intake",
    name: "Intake & Triage",
    owner: ["PM"],
    participants: ["DEV"],
    track: "fast",
    description: "Прием задачи. Источники: запрос банка, хотфикс, бэкенд-необходимость, инцидент. Классификация: hotfix / operational / minor improvement.",
    artifacts: ["Task in Git (template filled)"],
    checklist: {
      PM: [
        "Источник и причина задачи зафиксированы",
        "Тип задачи определен (hotfix / operational / minor improvement)",
        "Критичность оценена",
        "Задача заведена в Git по шаблону",
        "Влияние на ТН оценено (да/нет)",
      ],
      DEV: [
        "Техническая оценка трудозатрат дана",
        "Риски озвучены",
      ],
    },
  },
  {
    id: "ft-spec",
    name: "Lightweight Spec",
    owner: ["PM"],
    participants: ["DEV", "QA"],
    track: "fast",
    description: "Минимальная спецификация. Без полного Discovery и ICE. Фокус на: что делаем, зачем, как проверяем.",
    artifacts: ["Task Description", "Acceptance Criteria", "Test Cases (basic)"],
    checklist: {
      PM: [
        "Что делаем -- описано",
        "Зачем -- обоснование есть",
        "Критерии приемки -- 3-5 пунктов",
        "Figma -- приложена (если UI меняется)",
        "Feature flag -- нужен или нет",
        "Compliance -- не требуется / согласовано",
      ],
      QA: [
        "Базовые тест-кейсы написаны",
        "Тестовые данные определены",
      ],
      DEV: [
        "Задача декомпозирована (если > 1 дня)",
        "API-изменения описаны",
      ],
    },
  },
  {
    id: "ft-dev",
    name: "Development & Testing",
    owner: ["DEV"],
    participants: ["QA", "PM"],
    track: "fast",
    description: "Разработка и тестирование в сжатом цикле. Code review обязателен. QA тестирует параллельно.",
    artifacts: ["Working Code", "Test Results"],
    checklist: {
      DEV: [
        "Код написан",
        "Code review пройден",
        "Unit-тесты написаны (для hotfix -- минимум)",
        "Merge request аппрувнут",
        "Feature flag активирован (если нужен)",
      ],
      QA: [
        "Тест-кейсы выполнены",
        "Регрессия ключевых сценариев пройдена",
        "Баги зарепорчены и исправлены",
      ],
      PM: [
        "Acceptance testing пройден",
        "Go/No-Go решение принято",
      ],
    },
  },
  {
    id: "ft-release",
    name: "Release & Monitor",
    owner: ["PM"],
    participants: ["DEVOPS", "DEV", "SUPPORT"],
    track: "fast",
    description: "Релиз. Для hotfix -- ускоренный цикл (мимо RC если критично). Мониторинг 24-48ч.",
    artifacts: ["Release", "Monitoring Results"],
    checklist: {
      PM: [
        "Поддержка уведомлена (если user-facing)",
        "Feature flag раскатка по плану",
        "Мониторинг 24ч -- ОК",
        "Задача закрыта в Git",
      ],
      DEVOPS: [
        "Релиз выполнен",
        "Мониторинг ошибок настроен",
      ],
      DEV: [
        "Логи проверены",
        "Feature flag удален после стабилизации",
      ],
    },
  },
];

const RoleBadge = ({ roleKey, small }) => {
  const role = ROLES[roleKey];
  if (!role) return null;
  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "1px 6px" : "2px 8px",
        borderRadius: "4px",
        fontSize: small ? "10px" : "11px",
        fontWeight: 600,
        color: role.color,
        backgroundColor: role.bg,
        border: `1px solid ${role.color}20`,
        marginRight: "4px",
        marginBottom: "2px",
      }}
    >
      {role.label}
    </span>
  );
};

const CheckItem = ({ text, checked, onChange }) => (
  <label
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "6px 0",
      cursor: "pointer",
      fontSize: "13px",
      lineHeight: "1.4",
      color: checked ? "#9CA3AF" : "#1F2937",
      textDecoration: checked ? "line-through" : "none",
      userSelect: "none",
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ marginTop: "2px", accentColor: "#3B82F6", cursor: "pointer", flexShrink: 0 }}
    />
    <span>{text}</span>
  </label>
);

const ProgressBar = ({ completed, total }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
      <div style={{ flex: 1, height: "6px", backgroundColor: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: pct === 100 ? "#10B981" : "#3B82F6",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600, minWidth: "42px" }}>
        {completed}/{total}
      </span>
    </div>
  );
};

const StageCard = ({ stage, checks, onCheck, expanded, onToggle, roleFilter }) => {
  const allRoles = [...(stage.owner || []), ...(stage.participants || [])];
  const relevantRoles = roleFilter
    ? Object.keys(stage.checklist || {}).filter((r) => r === roleFilter)
    : Object.keys(stage.checklist || {});

  const totalItems = relevantRoles.reduce((sum, r) => sum + (stage.checklist[r] || []).length, 0);
  const checkedItems = relevantRoles.reduce(
    (sum, r) =>
      sum +
      (stage.checklist[r] || []).filter((_, i) => checks[`${stage.id}-${r}-${i}`]).length,
    0
  );

  const isComplete = totalItems > 0 && checkedItems === totalItems;

  if (roleFilter && !allRoles.includes(roleFilter) && relevantRoles.length === 0) return null;

  return (
    <div
      style={{
        border: stage.gate ? "2px solid #EF4444" : "1px solid #E5E7EB",
        borderRadius: "8px",
        marginBottom: "8px",
        backgroundColor: isComplete ? "#F0FDF4" : "#FFFFFF",
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: "12px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "16px", color: "#9CA3AF", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          &#9654;
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{stage.name}</span>
            {stage.gate && (
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#EF4444", border: "1px solid #EF4444", borderRadius: "4px", padding: "1px 6px", textTransform: "uppercase" }}>
                Gate
              </span>
            )}
            {isComplete && (
              <span style={{ fontSize: "13px", color: "#10B981" }}>&#10003;</span>
            )}
          </div>
          <div style={{ marginTop: "4px" }}>
            {(stage.owner || []).map((r) => <RoleBadge key={r} roleKey={r} small />)}
            {(stage.participants || []).map((r) => (
              <span key={r} style={{ fontSize: "10px", color: "#9CA3AF", marginRight: "4px" }}>
                +{ROLES[r]?.label}
              </span>
            ))}
          </div>
          <ProgressBar completed={checkedItems} total={totalItems} />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "12px 0 8px 0", lineHeight: "1.5" }}>
            {stage.description}
          </p>

          {stage.artifacts && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Artifacts
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {stage.artifacts.map((a) => (
                  <span key={a} style={{ fontSize: "11px", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "4px", color: "#4B5563" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relevantRoles.map((roleKey) => (
            <div key={roleKey} style={{ marginBottom: "12px" }}>
              <RoleBadge roleKey={roleKey} />
              <div style={{ marginLeft: "4px", marginTop: "4px" }}>
                {(stage.checklist[roleKey] || []).map((item, i) => (
                  <CheckItem
                    key={i}
                    text={item}
                    checked={!!checks[`${stage.id}-${roleKey}-${i}`]}
                    onChange={() => onCheck(`${stage.id}-${roleKey}-${i}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FeatureLifecycle() {
  const [track, setTrack] = useState("full");
  const [roleFilter, setRoleFilter] = useState(null);
  const [checks, setChecks] = useState({});
  const [expanded, setExpanded] = useState({});
  const [featureName, setFeatureName] = useState("");

  const stages = track === "full" ? FULL_CYCLE_STAGES : FAST_TRACK_STAGES;

  const toggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    stages.forEach((s) => (all[s.id] = true));
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  const stats = useMemo(() => {
    let total = 0;
    let checked = 0;
    stages.forEach((stage) => {
      const roles = roleFilter
        ? Object.keys(stage.checklist || {}).filter((r) => r === roleFilter)
        : Object.keys(stage.checklist || {});
      roles.forEach((r) => {
        (stage.checklist[r] || []).forEach((_, i) => {
          total++;
          if (checks[`${stage.id}-${r}-${i}`]) checked++;
        });
      });
    });
    return { total, checked, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  }, [checks, stages, roleFilter]);

  const resetAll = () => {
    setChecks({});
    setExpanded({});
    setFeatureName("");
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
          Feature Lifecycle
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Freedom Finance -- Banking Products
        </p>
      </div>

      {/* Feature Name */}
      <input
        type="text"
        placeholder="Название фичи / задачи..."
        value={featureName}
        onChange={(e) => setFeatureName(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #D1D5DB",
          borderRadius: "6px",
          fontSize: "14px",
          marginBottom: "16px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {/* Track Switcher */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { key: "full", label: "Full Cycle", desc: "Roadmap features" },
          { key: "fast", label: "Fast-Track", desc: "Hotfixes, ops tasks" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTrack(t.key); setExpanded({}); }}
            style={{
              flex: 1,
              padding: "10px",
              border: track === t.key ? "2px solid #3B82F6" : "1px solid #E5E7EB",
              borderRadius: "8px",
              backgroundColor: track === t.key ? "#EFF6FF" : "#FFFFFF",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "14px", color: track === t.key ? "#1D4ED8" : "#374151" }}>
              {t.label}
            </div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Role Filter */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
          Filter by Role
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          <button
            onClick={() => setRoleFilter(null)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              border: !roleFilter ? "2px solid #374151" : "1px solid #E5E7EB",
              backgroundColor: !roleFilter ? "#1F2937" : "#FFFFFF",
              color: !roleFilter ? "#FFFFFF" : "#6B7280",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {Object.entries(ROLES).map(([key, role]) => (
            <button
              key={key}
              onClick={() => setRoleFilter(roleFilter === key ? null : key)}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: roleFilter === key ? `2px solid ${role.color}` : "1px solid #E5E7EB",
                backgroundColor: roleFilter === key ? role.bg : "#FFFFFF",
                color: roleFilter === key ? role.color : "#6B7280",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div style={{ backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Overall Progress{roleFilter ? ` (${ROLES[roleFilter].label})` : ""}
          </span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: stats.pct === 100 ? "#10B981" : "#3B82F6" }}>
            {stats.pct}%
          </span>
        </div>
        <ProgressBar completed={stats.checked} total={stats.total} />
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button onClick={expandAll} style={{ fontSize: "11px", color: "#6B7280", cursor: "pointer", background: "none", border: "none", padding: 0, textDecoration: "underline" }}>
            Expand All
          </button>
          <button onClick={collapseAll} style={{ fontSize: "11px", color: "#6B7280", cursor: "pointer", background: "none", border: "none", padding: 0, textDecoration: "underline" }}>
            Collapse All
          </button>
          <button onClick={resetAll} style={{ fontSize: "11px", color: "#EF4444", cursor: "pointer", background: "none", border: "none", padding: 0, textDecoration: "underline" }}>
            Reset
          </button>
        </div>
      </div>

      {/* Stages */}
      {stages.map((stage) => (
        <StageCard
          key={stage.id}
          stage={stage}
          checks={checks}
          onCheck={toggleCheck}
          expanded={!!expanded[stage.id]}
          onToggle={() => toggleExpand(stage.id)}
          roleFilter={roleFilter}
        />
      ))}

      {/* Footer */}
      <div style={{ marginTop: "24px", padding: "12px 16px", backgroundColor: "#FFFBEB", borderRadius: "8px", border: "1px solid #FDE68A" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
          Context & Constraints
        </div>
        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#78350F", lineHeight: "1.6" }}>
          <li>Роли SA и Analytics отсутствуют. Техдокументация -- на Tech Lead / Senior. Аналитика -- gap.</li>
          <li>Единая кодовая база с TN -- обязательна оценка влияния на каждом этапе.</li>
          <li>Feature flags -- обязательны для всех крупных фич. Раскатка: Dev → RC → Prod (10%) → Prod (100%).</li>
          <li>Compliance-согласование -- до начала разработки для customer-facing изменений.</li>
          <li>Тестирование на проде (позиция Дениса) -- учитывать при планировании QA.</li>
        </ul>
      </div>
    </div>
  );
}
