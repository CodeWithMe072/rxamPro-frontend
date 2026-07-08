import React, { useState, useEffect } from 'react';
import { Palette, Check, Clock, User, Loader2, Edit3, Settings2 } from 'lucide-react';
import { THEMES, THEME_KEYS } from '../../config/themes';
import { settingsService } from '../../services/settings.service';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';

export const ThemeSettings = () => {
  const { colorTheme, setColorTheme, customTheme, isDark, uiStrings, setUiStrings } = useTheme();
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'labels'
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(colorTheme); // preview selection before save
  const [lastSaved, setLastSaved] = useState(null);

  // Custom colors state
  const [customColors, setCustomColors] = useState({
    primary: customTheme?.primary || '#004ac6',
    secondary: customTheme?.secondary || '#006c49',
    background: customTheme?.background || '#faf8ff',
    darkPrimary: customTheme?.darkPrimary || '#b4c5ff',
    darkSecondary: customTheme?.darkSecondary || '#6ffbbe',
    darkBackground: customTheme?.darkBackground || '#0f1322',
  });

  const [maxAdmins, setMaxAdmins] = useState(1);
  const [maxSubAdmins, setMaxSubAdmins] = useState(5);

  const [editableStrings, setEditableStrings] = useState({});

  useEffect(() => {
    settingsService.getTheme().then(data => {
      if (data) {
        if (data.maxAdmins !== undefined) setMaxAdmins(data.maxAdmins);
        if (data.maxSubAdmins !== undefined) setMaxSubAdmins(data.maxSubAdmins);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (uiStrings) {
      setEditableStrings(uiStrings);
    }
  }, [uiStrings]);

  // Sync custom colors when customTheme context updates
  useEffect(() => {
    if (customTheme) {
      setCustomColors({
        primary: customTheme.primary || '#004ac6',
        secondary: customTheme.secondary || '#006c49',
        background: customTheme.background || '#faf8ff',
        darkPrimary: customTheme.darkPrimary || '#b4c5ff',
        darkSecondary: customTheme.darkSecondary || '#6ffbbe',
        darkBackground: customTheme.darkBackground || '#0f1322',
      });
    }
  }, [customTheme]);

  const handleCustomColorChange = (key, value) => {
    setCustomColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    // If not 'custom' and no change, do nothing
    if (pending === colorTheme && pending !== 'custom') return;
    
    // Check if custom theme colors are different from current ones
    const isCustomChanged = pending === 'custom' && (
      customColors.primary !== customTheme?.primary ||
      customColors.secondary !== customTheme?.secondary ||
      customColors.background !== customTheme?.background ||
      customColors.darkPrimary !== customTheme?.darkPrimary ||
      customColors.darkSecondary !== customTheme?.darkSecondary ||
      customColors.darkBackground !== customTheme?.darkBackground
    );

    if (pending === colorTheme && pending === 'custom' && !isCustomChanged) {
      toast.error("No changes made to save!");
      return;
    }

    setSaving(true);
    try {
      const payloadColors = pending === 'custom' ? customColors : undefined;
      const result = await settingsService.updateTheme(pending, payloadColors, maxAdmins, maxSubAdmins);
      
      // Update globally
      setColorTheme(pending, payloadColors);
      setLastSaved(result);
      
      toast.success(
        pending === 'custom'
          ? 'Custom theme colors applied successfully!'
          : `Theme changed to "${THEMES[pending]?.name || 'Custom Theme'}"!`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update theme.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStrings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedMap = await settingsService.updateUIStrings(editableStrings);
      setUiStrings(updatedMap);
      toast.success('UI strings and labels customized successfully!');
    } catch (err) {
      toast.error('Failed to update UI customizations.');
    } finally {
      setSaving(false);
    }
  };

  // Preset check
  const isCustomPending = pending === 'custom';
  const isCustomActive = colorTheme === 'custom';

  return (
    <div className="space-y-8 text-on-surface">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">System Settings & Customization</h1>
          </div>
          <p className="text-sm text-on-surface-variant ml-13">
            Manage site-wide styles, theme color palettes, guidelines, rules, and proctoring greetings.
          </p>
        </div>

        {activeTab === 'theme' && (
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="gradient"
            className="flex items-center gap-2 min-w-32"
            size="sm"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Check className="w-4 h-4" /> Apply Theme</>
            }
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/20 gap-6 text-sm font-semibold pt-2">
        <button
          onClick={() => setActiveTab('theme')}
          className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'theme' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Color Themes
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'labels' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Portal Text & Warnings
        </button>
      </div>

      {/* Last updated info */}
      {activeTab === 'theme' && lastSaved && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container px-4 py-2 rounded-xl w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated by <strong>{lastSaved.updatedBy?.name || 'Admin'}</strong> · just now</span>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-8">

      {/* Theme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Preset Themes */}
        {THEME_KEYS.map((key) => {
          const t = THEMES[key];
          const isActive = colorTheme === key;
          const isPending = pending === key;
          const vars = isDark ? t.dark : t.light;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setPending(key)}
              className={`
                group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer
                ${isPending
                  ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'border-outline-variant hover:border-outline hover:scale-[1.01]'
                }
              `}
            >
              {/* Active site badge */}
              {isActive && (
                <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-widest bg-secondary text-on-secondary px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}

              {/* Color preview swatches */}
              <div className="mb-3 rounded-xl overflow-hidden h-24 relative"
                style={{ background: vars['--color-background'] }}
              >
                {/* Simulated sidebar */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col gap-1.5 p-1.5"
                  style={{ background: vars['--color-surface-container-low'] }}
                >
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-1.5 rounded-full"
                      style={{
                        background: i === 0
                          ? vars['--color-primary']
                          : vars['--color-outline-variant'],
                        width: i === 0 ? '80%' : `${55 + i * 10}%`
                      }}
                    />
                  ))}
                </div>
                {/* Simulated content area */}
                <div className="absolute left-12 top-2 right-2 space-y-1.5">
                  <div className="h-2 w-3/4 rounded-full"
                    style={{ background: vars['--color-on-surface'] + '33' }} />
                  <div className="h-6 w-full rounded-lg"
                    style={{ background: vars['--color-primary-container'] + '80' }} />
                  <div className="flex gap-1">
                    <div className="h-4 flex-1 rounded-md"
                      style={{ background: vars['--color-surface-container'] }} />
                    <div className="h-4 w-8 rounded-md"
                      style={{ background: vars['--color-secondary'] }} />
                  </div>
                </div>
              </div>

              {/* Color dot row */}
              <div className="flex items-center gap-1.5 mb-3">
                {[
                  vars['--color-primary'],
                  vars['--color-secondary'],
                  vars['--color-tertiary'],
                  vars['--color-surface-container-high'],
                  vars['--color-on-surface'],
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-outline-variant/20 flex-shrink-0"
                    style={{ background: color }}
                  />
                ))}
              </div>

              {/* Label */}
              <p className="text-sm font-bold text-on-surface">{t.name}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{t.description}</p>

              {/* Selected check */}
              {isPending && (
                <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-on-primary" />
                </div>
              )}
            </button>
          );
        })}

        {/* Custom Theme Choice Card */}
        <button
          type="button"
          onClick={() => setPending('custom')}
          className={`
            group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer
            ${isCustomPending
              ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
              : 'border-outline-variant hover:border-outline hover:scale-[1.01]'
            }
          `}
        >
          {/* Active site badge */}
          {isCustomActive && (
            <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-widest bg-secondary text-on-secondary px-2 py-0.5 rounded-full">
              Active
            </span>
          )}

          {/* Color preview swatches using current custom colors state */}
          <div className="mb-3 rounded-xl overflow-hidden h-24 relative"
            style={{ background: isDark ? customColors.darkBackground : customColors.background }}
          >
            {/* Simulated sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col gap-1.5 p-1.5"
              style={{ background: isDark ? '#131726' : '#f2f3ff' }}
            >
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-1.5 rounded-full"
                  style={{
                    background: i === 0
                      ? (isDark ? customColors.darkPrimary : customColors.primary)
                      : '#c3c6d7',
                    width: i === 0 ? '80%' : `${55 + i * 10}%`
                  }}
                />
              ))}
            </div>
            {/* Simulated content area */}
            <div className="absolute left-12 top-2 right-2 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full"
                style={{ background: '#73768633' }} />
              <div className="h-6 w-full rounded-lg"
                style={{
                  background: isDark ? customColors.darkPrimary + '30' : customColors.primary + '30',
                  border: `1px solid ${isDark ? customColors.darkPrimary : customColors.primary}`
                }}
              />
              <div className="flex gap-1">
                <div className="h-4 flex-1 rounded-md"
                  style={{ background: isDark ? '#1b2034' : '#eaedff' }} />
                <div className="h-4 w-8 rounded-md"
                  style={{ background: isDark ? customColors.darkSecondary : customColors.secondary }} />
              </div>
            </div>
          </div>

          {/* Color dot row using current customColors */}
          <div className="flex items-center gap-1.5 mb-3">
            {[
              isDark ? customColors.darkPrimary : customColors.primary,
              isDark ? customColors.darkSecondary : customColors.secondary,
              isDark ? customColors.darkBackground : customColors.background,
            ].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-outline-variant/20 flex-shrink-0"
                style={{ background: color }}
              />
            ))}
            <span className="text-[10px] text-slate-500 font-bold">Custom</span>
          </div>

          {/* Label */}
          <p className="text-sm font-bold text-on-surface">Custom Palette</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
            Configure custom colors for light & dark mode.
          </p>

          {/* Selected check */}
          {isCustomPending && (
            <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-on-primary" />
            </div>
          )}
        </button>
      </div>

      {/* Custom Theme Editor Form (Only visible when Custom card is selected) */}
      {isCustomPending && (
        <Card variant="glass" className="space-y-6 border border-primary/30 shadow-md">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <Settings2 className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Custom Theme Builder</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Light Mode Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Light Theme Colors
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Primary Color</span>
                    <p className="text-[10px] text-on-surface-variant">Buttons, active headers, accents</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Secondary Color</span>
                    <p className="text-[10px] text-on-surface-variant">Labels, success states, visual highlights</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Background Color</span>
                    <p className="text-[10px] text-on-surface-variant">Default canvas background for light mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Dark Theme Colors
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Dark Primary Color</span>
                    <p className="text-[10px] text-on-surface-variant">Primary elements under dark mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.darkPrimary}
                      onChange={(e) => handleCustomColorChange('darkPrimary', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.darkPrimary}
                      onChange={(e) => handleCustomColorChange('darkPrimary', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Dark Secondary Color</span>
                    <p className="text-[10px] text-on-surface-variant">Secondary accents under dark mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.darkSecondary}
                      onChange={(e) => handleCustomColorChange('darkSecondary', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.darkSecondary}
                      onChange={(e) => handleCustomColorChange('darkSecondary', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface">Dark Background Color</span>
                    <p className="text-[10px] text-on-surface-variant">Main dashboard background in dark mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColors.darkBackground}
                      onChange={(e) => handleCustomColorChange('darkBackground', e.target.value)}
                      className="w-18 h-7 bg-slate-950 border border-slate-800 rounded px-1.5 text-[11px] text-center uppercase outline-none focus:border-primary font-mono text-white"
                    />
                    <input
                      type="color"
                      value={customColors.darkBackground}
                      onChange={(e) => handleCustomColorChange('darkBackground', e.target.value)}
                      className="w-7 h-7 rounded-lg overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </Card>
        )}

        {/* Role Limit Configuration Card */}
        <div className="mt-8">
          <Card variant="glass" className="space-y-6 border border-outline-variant/20 shadow-md">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Settings2 className="w-4.5 h-4.5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Role Limit Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-on-surface-variant">
              <div>
                <label className="block mb-2 text-on-surface">Max Admin Accounts Allowed</label>
                <input 
                  type="number" 
                  min={1}
                  value={maxAdmins}
                  onChange={(e) => setMaxAdmins(Math.max(1, Number(e.target.value)))}
                  className="w-full h-11 px-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-on-surface font-mono focus:border-primary outline-none"
                />
                <p className="text-[10px] text-on-surface-variant/70 mt-1.5 font-medium leading-snug">
                  Specifies the maximum allowed Admin user accounts inside the system.
                </p>
              </div>
              <div>
                <label className="block mb-2 text-on-surface">Max Sub-Admin Accounts Allowed</label>
                <input 
                  type="number" 
                  min={0}
                  value={maxSubAdmins}
                  onChange={(e) => setMaxSubAdmins(Math.max(0, Number(e.target.value)))}
                  className="w-full h-11 px-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-on-surface font-mono focus:border-primary outline-none"
                />
                <p className="text-[10px] text-on-surface-variant/70 mt-1.5 font-medium leading-snug">
                  Specifies the maximum allowed Sub-Admin user accounts inside the system.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )}

      {/* ── PORTAL TEXT CUSTOMIZATION ── */}
      {activeTab === 'labels' && (
        <form onSubmit={handleSaveStrings} className="space-y-6">
          <Card variant="glass" className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">Portal Text Override Control</h3>
            <p className="text-xs text-on-surface-variant font-medium">Customize UI strings, greeting cards, guidelines, and warning labels dynamically.</p>

            <div className="grid grid-cols-1 gap-6 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Portal Brand Title</label>
                <input 
                  type="text" 
                  value={editableStrings['portal_title'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, portal_title: e.target.value }))}
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Login Page Welcome Message</label>
                <textarea 
                  value={editableStrings['login_welcome'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, login_welcome: e.target.value }))}
                  className="w-full h-20 p-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Rules & Guidelines Title</label>
                <input 
                  type="text" 
                  value={editableStrings['test_guidelines_title'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, test_guidelines_title: e.target.value }))}
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Tab Switch Proctor Warning Alert</label>
                <textarea 
                  value={editableStrings['proctoring_warning_message'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, proctoring_warning_message: e.target.value }))}
                  className="w-full h-20 p-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Fullscreen mode prompt warning</label>
                <textarea 
                  value={editableStrings['fullscreen_check_message'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, fullscreen_check_message: e.target.value }))}
                  className="w-full h-20 p-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Dashboard Certification Banner Header</label>
                <input 
                  type="text" 
                  value={editableStrings['dashboard_certification_banner_title'] || ''}
                  onChange={(e) => setEditableStrings(prev => ({ ...prev, dashboard_certification_banner_title: e.target.value }))}
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <Button type="submit" variant="gradient" disabled={saving} className="px-10 h-11 flex items-center justify-center gap-2 cursor-pointer">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Label Customizations'}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Info note */}
      <Card variant="glass" className="flex items-start gap-3 text-sm text-on-surface-variant">
        <User className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
        <p>
          System modifications are <strong className="text-on-surface">stored server-side</strong> and apply globally.
          All clients will see the updated values on their next page load or refresh.
          Only Admins can change configuration properties.
        </p>
      </Card>
    </div>
  );
};

export default ThemeSettings;
