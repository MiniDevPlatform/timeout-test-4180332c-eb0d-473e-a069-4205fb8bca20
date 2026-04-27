/**
 * MiniDev ONE Template - UI Components Library
 * 
 * Beautiful, animated UI components with design system integration.
 */

import {} from '@/lib/config';
import {} from './motion';

// =============================================================================
// BUTTON COMPONENT
// =============================================================================
export interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: string | HTMLElement;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export class Button {
  private element: HTMLElement;
  private props: ButtonProps;

  constructor(element: HTMLElement, props: ButtonProps = {}) {
    this.element = element;
    this.props = {
      variant: 'solid',
      size: 'md',
      iconPosition: 'left',
      rounded: 'md',
      shadow: 'md',
      ...props,
    };
    this.render();
  }

  private render(): void {
    const { variant, size, color, loading, disabled, icon, iconPosition, fullWidth, rounded, shadow } = this.props;
    

    const sizes: Record<string, string> = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    const shadows: Record<string, string> = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    const roundedMap: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    let bgStyle = '';
    let textStyle = '';
    let borderStyle = '';
    let hoverStyle = '';
    let transitionStyle = 'transition-all duration-200';

    switch (variant) {
      case 'solid':
        bgStyle = color || `bg-primary`;
        textStyle = 'text-white';
        hoverStyle = 'hover:opacity-90 hover:scale-105 active:scale-95';
        break;
      case 'outline':
        bgStyle = 'bg-transparent';
        textStyle = color ? `text-[${color}]` : 'text-primary';
        borderStyle = `border-2 border-current`;
        hoverStyle = 'hover:bg-primary/10';
        break;
      case 'ghost':
        bgStyle = 'bg-transparent';
        textStyle = color || 'text-primary';
        hoverStyle = 'hover:bg-muted';
        break;
      case 'link':
        bgStyle = 'bg-transparent';
        textStyle = color || 'text-primary';
        hoverStyle = 'hover:underline';
        break;
      case 'gradient':
        bgStyle = 'bg-gradient-to-r from-primary to-secondary';
        textStyle = 'text-white';
        hoverStyle = 'hover:scale-105 hover:shadow-lg active:scale-95';
        break;
      case 'glow':
        bgStyle = color || 'bg-primary';
        textStyle = 'text-white';
        hoverStyle = 'hover:scale-105 hover:shadow-[0_0_20px_currentColor] active:scale-95';
        break;
    }

    const classes = [
      'inline-flex items-center justify-center gap-2 font-medium cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      sizes[size!],
      roundedMap[rounded!],
      shadows[shadow!],
      bgStyle,
      textStyle,
      borderStyle,
      hoverStyle,
      transitionStyle,
      fullWidth ? 'w-full' : '',
    ].filter(Boolean).join(' ');

    const iconHtml = icon ? (typeof icon === 'string' ? `<span class="text-lg">${icon}</span>` : '') : '';
    const loadingHtml = loading ? '<span class="animate-spin">⟳</span>' : '';

    this.element.className = classes;
    this.element.innerHTML = `
      ${iconPosition === 'left' ? iconHtml : ''}
      ${loadingHtml}
      <span>${this.element.innerHTML}</span>
      ${iconPosition === 'right' ? iconHtml : ''}
    `;

    if (!loading) {
      this.element.addEventListener('click', () => {
        if (!disabled && this.props.onClick) {
          this.props.onClick();
        }
      });
    }
  }

  setProps(props: Partial<ButtonProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }

  showLoading(): void {
    this.setProps({ loading: true });
  }

  hideLoading(): void {
    this.setProps({ loading: false });
  }
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  prefix?: string;
  suffix?: string;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export class Input {
  private container: HTMLElement;
  private input: HTMLInputElement;
  private props: InputProps;

  constructor(container: HTMLElement, props: InputProps = {}) {
    this.container = container;
    this.props = {
      type: 'text',
      size: 'md',
      variant: 'outline',
      rounded: 'md',
      iconPosition: 'left',
      ...props,
    };

    this.input = document.createElement('input');
    this.render();
  }

  private render(): void {
    const { type, placeholder, value, label, helper, error, disabled, readonly, required, icon, iconPosition, prefix, suffix, clearable, size, variant, rounded } = this.props;
    

    const sizes: Record<string, string> = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
    };

    const roundedMap: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    const variants: Record<string, string> = {
      outline: `border bg-transparent focus:ring-2 focus:ring-primary/50`,
      filled: `border-0 bg-muted focus:ring-2 focus:ring-primary/50`,
      flushed: `border-0 border-b bg-transparent rounded-none focus:ring-0`,
    };

    const inputClasses = [
      'w-full outline-none transition-all duration-200',
      'placeholder:text-muted',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizes[size!],
      roundedMap[rounded!],
      variants[variant!],
      error ? 'border-red-500' : 'border-border',
      icon && iconPosition === 'left' ? 'pl-10' : '',
      icon && iconPosition === 'right' ? 'pr-10' : '',
      prefix ? 'pl-8' : '',
      suffix ? 'pr-8' : '',
    ].filter(Boolean).join(' ');

    this.input.type = type || 'text';
    this.input.placeholder = placeholder || '';
    this.input.value = value || '';
    this.input.disabled = disabled || false;
    this.input.readOnly = readonly || false;
    this.input.required = required || false;
    this.input.className = inputClasses;
    this.input.style.borderColor = error ? '#ef4444' : '';

    let wrapper = '';

    // Label
    if (label) {
      wrapper += `<label class="block text-sm font-medium mb-1">${label}${required ? '<span class="text-red-500">*</span>' : ''}</label>`;
    }

    // Input container
    wrapper += '<div class="relative">';

    // Prefix
    if (prefix) {
      wrapper += `<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">${prefix}</span>`;
    }

    // Icon left
    if (icon && iconPosition === 'left') {
      wrapper += `<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">${icon}</span>`;
    }

    wrapper += this.input.outerHTML;

    // Clear button
    if (clearable && value) {
      wrapper += `<button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary clear-btn">✕</button>`;
    }

    // Icon right
    if (icon && iconPosition === 'right') {
      wrapper += `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted">${icon}</span>`;
    }

    // Suffix
    if (suffix) {
      wrapper += `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted">${suffix}</span>`;
    }

    wrapper += '</div>';

    // Helper or error text
    if (error) {
      wrapper += `<p class="text-red-500 text-sm mt-1">${error}</p>`;
    } else if (helper) {
      wrapper += `<p class="text-muted text-sm mt-1">${helper}</p>`;
    }

    this.container.innerHTML = wrapper;
    this.container.className = 'w-full';

    // Re-get input element
    this.input = this.container.querySelector('input')!;
    this.attachEvents();
  }

  private attachEvents(): void {
    const clearBtn = this.container.querySelector('.clear-btn');
    clearBtn?.addEventListener('click', () => {
      this.input.value = '';
      this.input.dispatchEvent(new Event('input'));
    });

    this.input.addEventListener('input', () => {
      this.container.querySelector('.clear-btn')?.classList.toggle('hidden', !this.input.value);
    });
  }

  getValue(): string {
    return this.input.value;
  }

  setValue(value: string): void {
    this.input.value = value;
    this.render();
  }

  focus(): void {
    this.input.focus();
  }

  blur(): void {
    this.input.blur();
  }
}

// =============================================================================
// CARD COMPONENT
// =============================================================================
export interface CardProps {
  title?: string;
  subtitle?: string;
  header?: string | HTMLElement;
  footer?: string | HTMLElement;
  image?: string;
  imagePosition?: 'top' | 'bottom' | 'overlay';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'hover';
  onClick?: () => void;
}

export class Card {
  private element: HTMLElement;
  private props: CardProps;

  constructor(element: HTMLElement, props: CardProps = {}) {
    this.element = element;
    this.props = {
      padding: 'md',
      imagePosition: 'top',
      shadow: 'md',
      ...props,
    };
    this.render();
  }

  private render(): void {
    const { title, subtitle, header, footer, image, imagePosition, padding, hover, clickable, bordered, shadow } = this.props;
    

    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    const shadows: Record<string, string> = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      hover: 'hover:shadow-xl transition-shadow duration-300',
    };

    const classes = [
      'rounded-xl overflow-hidden',
      bordered ? 'border border-border' : '',
      paddings[padding!],
      shadows[shadow!],
      hover ? 'hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300' : '',
      clickable ? 'cursor-pointer' : '',
      'bg-card',
    ].filter(Boolean).join(' ');

    let content = '';

    // Image
    if (image && imagePosition === 'top') {
      content += `<div class="relative"><img src="${image}" alt="" class="w-full h-48 object-cover"></div>`;
    }

    // Header slot
    if (header) {
      if (typeof header === 'string') {
        content += `<div class="border-b border-border p-4">${header}</div>`;
      } else {
        content += `<div class="border-b border-border">${header.outerHTML}</div>`;
      }
    }

    // Content
    content += `<div class="p-4">`;
    if (title) content += `<h3 class="font-bold text-lg mb-1">${title}</h3>`;
    if (subtitle) content += `<p class="text-muted text-sm">${subtitle}</p>`;
    content += `</div>`;

    // Image overlay
    if (image && imagePosition === 'overlay') {
      content += `<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>`;
    }

    // Image bottom
    if (image && imagePosition === 'bottom') {
      content += `<div class="relative"><img src="${image}" alt="" class="w-full h-48 object-cover"></div>`;
    }

    // Footer
    if (footer) {
      if (typeof footer === 'string') {
        content += `<div class="border-t border-border p-4">${footer}</div>`;
      } else {
        content += `<div class="border-t border-border">${footer.outerHTML}</div>`;
      }
    }

    this.element.className = `${classes} relative`;
    this.element.innerHTML = content;

    if (clickable && this.props.onClick) {
      this.element.addEventListener('click', this.props.onClick);
    }
  }
}

// =============================================================================
// MODAL COMPONENT
// =============================================================================
export interface ModalProps {
  title?: string;
  content?: string | HTMLElement;
  footer?: string | HTMLElement;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  animated?: boolean;
  overlayColor?: string;
}

export class Modal {
  private overlay: HTMLElement;
  private content: HTMLElement;
  private props: ModalProps;
  private isOpen: boolean = false;

  constructor(props: ModalProps = {}) {
    this.props = {
      size: 'md',
      closable: true,
      closeOnOverlay: true,
      closeOnEsc: true,
      animated: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      ...props,
    };

    this.overlay = document.createElement('div');
    this.content = document.createElement('div');

    this.create();
    this.attachEvents();
  }

  private create(): void {
    const { title, content, footer, size, closable } = this.props;
    

    const sizes: Record<string, string> = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    };

    const modalContent = content instanceof HTMLElement ? content.outerHTML : content || '';

    this.overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    this.overlay.style.backgroundColor = this.props.overlayColor!;
    this.overlay.style.backdropFilter = 'blur(4px)';

    this.content.className = `
      relative w-full ${sizes[size!]}
      bg-card rounded-2xl shadow-2xl
      transform transition-all duration-300
      ${this.props.animated ? 'scale-95 opacity-0' : ''}
    `;

    this.content.innerHTML = `
      ${closable ? `
        <button class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors close-btn">
          ✕
        </button>
      ` : ''}
      
      ${title ? `
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-xl font-bold">${title}</h2>
        </div>
      ` : ''}
      
      <div class="px-6 pb-4 max-h-[60vh] overflow-y-auto">
        ${modalContent}
      </div>
      
      ${footer ? `
        <div class="px-6 pb-6 border-t pt-4 flex justify-end gap-2">
          ${typeof footer === 'string' ? footer : footer.outerHTML}
        </div>
      ` : ''}
    `;

    this.overlay.appendChild(this.content);
    this.overlay.style.display = 'none';
  }

  private attachEvents(): void {
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay && this.props.closeOnOverlay) {
        this.close();
      }
    });

    this.content.querySelector('.close-btn')?.addEventListener('click', () => {
      this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && this.props.closeOnEsc) {
        this.close();
      }
    });
  }

  open(): void {
    document.body.appendChild(this.overlay);
    this.overlay.style.display = 'flex';
    this.isOpen = true;

    if (this.props.animated) {
      requestAnimationFrame(() => {
        this.content.classList.remove('scale-95', 'opacity-0');
        this.content.classList.add('scale-100', 'opacity-100');
      });
    }
  }

  close(): void {
    if (this.props.animated) {
      this.content.classList.remove('scale-100', 'opacity-100');
      this.content.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        this.overlay.style.display = 'none';
        this.overlay.remove();
      }, 300);
    } else {
      this.overlay.style.display = 'none';
      this.overlay.remove();
    }
    this.isOpen = false;
  }

  setContent(content: string | HTMLElement): void {
    const contentEl = this.content.querySelector('.px-6.pb-4, .px-6:first-of-type') as HTMLElement;
    if (contentEl) {
      contentEl.innerHTML = content instanceof HTMLElement ? content.outerHTML : content;
    }
  }

  setFooter(footer: string | HTMLElement): void {
    let footerEl = this.content.querySelector('.border-t');
    if (!footerEl) {
      footerEl = document.createElement('div');
      footerEl.className = 'px-6 pb-6 border-t pt-4 flex justify-end gap-2';
      this.content.appendChild(footerEl);
    }
    footerEl.innerHTML = typeof footer === 'string' ? footer : footer.outerHTML;
  }
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  title?: string;
  icon?: string;
  closable?: boolean;
  action?: { label: string; onClick: () => void };
  progress?: boolean;
}

export class Toast {
  private container: HTMLElement;
  private toasts: HTMLElement[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(this.container);
  }

  show(options: ToastOptions): HTMLElement {
    const { message, type = 'default', duration = 3000, title, icon, closable = true, action, progress = false } = options;
    
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      default: '•',
    };

    const colors: Record<ToastType, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      default: 'bg-gray-500',
    };

    const toast = document.createElement('div');
    toast.className = `
      flex items-start gap-3 p-4 rounded-xl shadow-lg text-white
      transform transition-all duration-300 translate-x-full
      ${colors[type]}
      max-w-sm
    `;

    toast.innerHTML = `
      <span class="text-xl">${icon || icons[type]}</span>
      <div class="flex-1">
        ${title ? `<div class="font-bold mb-1">${title}</div>` : ''}
        <div>${message}</div>
        ${action ? `<button class="mt-2 px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30">${action.label}</button>` : ''}
      </div>
      ${closable ? '<button class="text-white/70 hover:text-white close-toast">✕</button>' : ''}
      ${progress ? '<div class="absolute bottom-0 left-0 h-1 bg-white/30 progress-bar" style="width: 100%; animation: shrink ' + duration + 'ms linear"></div>' : ''}
    `;

    toast.style.position = 'relative';
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });

    // Close button
    toast.querySelector('.close-toast')?.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Action
    if (action) {
      toast.querySelector('button')?.addEventListener('click', () => {
        action.onClick();
        this.dismiss(toast);
      });
    }

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast: HTMLElement): void {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  success(message: string, options?: Partial<ToastOptions>): HTMLElement {
    return this.show({ message, type: 'success', ...options });
  }

  error(message: string, options?: Partial<ToastOptions>): HTMLElement {
    return this.show({ message, type: 'error', duration: 5000, ...options });
  }

  warning(message: string, options?: Partial<ToastOptions>): HTMLElement {
    return this.show({ message, type: 'warning', ...options });
  }

  info(message: string, options?: Partial<ToastOptions>): HTMLElement {
    return this.show({ message, type: 'info', ...options });
  }
}

// =============================================================================
// TABS COMPONENT
// =============================================================================
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: string | HTMLElement;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'line' | 'pill' | 'enclosed' | 'sidebar';
  size?: 'sm' | 'md' | 'lg';
  onChange?: (tabId: string) => void;
}

export class Tabs {
  private container: HTMLElement;
  private props: TabsProps;
  private activeTab: string;

  constructor(container: HTMLElement, props: TabsProps) {
    this.container = container;
    this.props = {
      variant: 'line',
      size: 'md',
      defaultTab: props.tabs[0]?.id,
      ...props,
    };
    this.activeTab = this.props.defaultTab!;
    this.render();
  }

  private render(): void {
    const { tabs, variant, size } = this.props;
    

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    let tabListClasses = 'flex';
    let tabClasses = 'font-medium transition-all duration-200';

    switch (variant) {
      case 'line':
        tabListClasses += ' border-b border-border';
        tabClasses += ' px-4 py-3 border-b-2 border-transparent hover:border-primary';
        break;
      case 'pill':
        tabClasses += ' px-4 py-2 rounded-full';
        break;
      case 'enclosed':
        tabClasses += ' px-4 py-2 border border-border rounded-t-lg -mb-px';
        break;
      case 'sidebar':
        tabClasses += ' w-full text-left px-4 py-3 rounded-lg hover:bg-muted';
        break;
    }

    // Render tabs
    let html = `<div class="${variant === 'sidebar' ? 'flex' : 'block'}">`;

    if (variant !== 'sidebar') {
      html += `<div class="${tabListClasses}">`;
      tabs.forEach(tab => {
        const isActive = tab.id === this.activeTab;
        html += `
          <button 
            class="${tabClasses} ${sizes[size!]} ${isActive ? 'text-primary border-primary' : 'text-muted hover:text-primary'}"
            data-tab="${tab.id}"
            ${tab.disabled ? 'disabled' : ''}
          >
            ${tab.icon ? `<span class="mr-2">${tab.icon}</span>` : ''}
            ${tab.label}
            ${tab.badge ? `<span class="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">${tab.badge}</span>` : ''}
          </button>
        `;
      });
      html += `</div>`;
    }

    html += `<div class="flex-1 mt-4">`;
    tabs.forEach(tab => {
      const isActive = tab.id === this.activeTab;
      html += `
        <div class="tab-content ${isActive ? '' : 'hidden'}" data-content="${tab.id}">
          ${tab.content instanceof HTMLElement ? tab.content.outerHTML : tab.content}
        </div>
      `;
    });
    html += `</div>`;

    // Sidebar variant
    if (variant === 'sidebar') {
      html = `<div class="flex gap-4"><div class="w-48 flex flex-col gap-2">`;
      tabs.forEach(tab => {
        const isActive = tab.id === this.activeTab;
        html += `
          <button 
            class="${tabClasses} ${sizes[size!]} ${isActive ? 'bg-primary text-white' : ''}"
            data-tab="${tab.id}"
            ${tab.disabled ? 'disabled' : ''}
          >
            ${tab.icon ? `<span class="mr-2">${tab.icon}</span>` : ''}
            ${tab.label}
            ${tab.badge ? `<span class="ml-auto px-2 py-0.5 bg-muted text-xs rounded-full">${tab.badge}</span>` : ''}
          </button>
        `;
      });
      html += `</div><div class="flex-1">`;
      tabs.forEach(tab => {
        const isActive = tab.id === this.activeTab;
        html += `
          <div class="tab-content ${isActive ? '' : 'hidden'}" data-content="${tab.id}">
            ${tab.content instanceof HTMLElement ? tab.content.outerHTML : tab.content}
          </div>
        `;
      });
      html += `</div></div>`;
    }

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents(): void {
    this.container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = (btn as HTMLElement).dataset.tab!;
        this.setActiveTab(tabId);
      });
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.render();
    this.props.onChange?.(tabId);
  }

  getActiveTab(): string {
    return this.activeTab;
  }
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================
export interface BadgeProps {
  label: string;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: string;
  removable?: boolean;
  onRemove?: () => void;
}

export function createBadge(element: HTMLElement, props: BadgeProps): void {
  const { label, variant = 'subtle', color = 'primary', size = 'sm', icon, removable } = props;
  
  const colors: Record<string, Record<string, string>> = {
    solid: {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      gray: 'bg-gray-500 text-white',
    },
    outline: {
      primary: 'border-2 border-primary text-primary',
      secondary: 'border-2 border-secondary text-secondary',
      success: 'border-2 border-green-500 text-green-500',
      warning: 'border-2 border-yellow-500 text-yellow-500',
      error: 'border-2 border-red-500 text-red-500',
      info: 'border-2 border-blue-500 text-blue-500',
      gray: 'border-2 border-gray-500 text-gray-500',
    },
    subtle: {
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary/10 text-secondary',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
  };

  const sizes: Record<string, string> = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-sm',
    md: 'px-3 py-1 text-base',
    lg: 'px-4 py-2 text-lg',
  };

  element.className = `inline-flex items-center gap-1 font-medium rounded-full ${sizes[size]} ${colors[variant][color]}`;
  element.innerHTML = `
    ${icon ? `<span>${icon}</span>` : ''}
    <span>${label}</span>
    ${removable ? '<button class="ml-1 hover:opacity-70 remove-btn">✕</button>' : ''}
  `;

  if (removable) {
    element.querySelector('.remove-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      props.onRemove?.();
      element.remove();
    });
  }
}

// =============================================================================
// SKELETON COMPONENT
// =============================================================================
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export function createSkeleton(element: HTMLElement, props: SkeletonProps): void {
  const { variant = 'text', width, height, animation = 'wave', lines = 1 } = props;
  
  const animations: Record<string, string> = {
    pulse: 'animate-pulse bg-muted',
    wave: 'relative overflow-hidden bg-muted',
    none: 'bg-muted',
  };

  const variants: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl h-48',
  };

  let html = '';
  for (let i = 0; i < lines; i++) {
    const w = width || (variant === 'text' ? `${100 - Math.random() * 20}%` : '100%');
    const h = height || (variant === 'card' ? '192px' : variant === 'circular' ? w : '1rem');
    
    html += `
      <div 
        class="${variants[variant]} ${animations[animation]}" 
        style="width: ${typeof w === 'number' ? w + 'px' : w}; height: ${typeof h === 'number' ? h + 'px' : h}"
      >
        ${animation === 'wave' ? '<div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>' : ''}
      </div>
    `;
  }

  element.innerHTML = html;
  element.className = lines > 1 ? 'space-y-2' : '';
}

// =============================================================================
// DROPDOWN COMPONENT
// =============================================================================
export interface DropdownProps {
  trigger: HTMLElement | string;
  items: Array<{
    label: string;
    icon?: string;
    value?: string;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
    onClick?: () => void;
  }>;
  align?: 'left' | 'right';
  width?: number;
  animated?: boolean;
}

export class Dropdown {
  private overlay: HTMLElement;
  private menu: HTMLElement;
  private props: DropdownProps;

  constructor(props: DropdownProps) {
    this.props = {
      align: 'left',
      width: 200,
      animated: true,
      ...props,
    };

    this.overlay = document.createElement('div');
    this.menu = document.createElement('div');

    this.create();
  }

  private create(): void {
    const { items, align, width, animated } = this.props;
    

    this.overlay.className = 'fixed inset-0 z-40';
    this.menu.className = `
      absolute top-full mt-2 min-w-[${width}px]
      bg-card rounded-xl shadow-xl border border-border
      py-2 overflow-hidden
      ${animated ? 'opacity-0 scale-95 transform' : ''}
    `;
    this.menu.style.width = `${width}px`;
    this.menu.style.left = align === 'right' ? 'auto' : '0';
    this.menu.style.right = align === 'right' ? '0' : 'auto';

    let html = '';
    items.forEach(item => {
      if (item.divider) {
        html += '<div class="my-2 border-t border-border"></div>';
      } else {
        html += `
          <button 
            class="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-muted transition-colors ${item.danger ? 'text-red-500 hover:bg-red-50' : ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}"
            ${item.disabled ? 'disabled' : ''}
            data-value="${item.value || ''}"
          >
            ${item.icon ? `<span class="text-lg">${item.icon}</span>` : ''}
            <span>${item.label}</span>
          </button>
        `;
      }
    });

    this.menu.innerHTML = html;
    this.overlay.appendChild(this.menu);
  }

  show(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();

    // Position
    this.menu.style.top = `${rect.bottom + 8}px`;
    if (this.props.align === 'right') {
      this.menu.style.left = 'auto';
      this.menu.style.right = `${window.innerWidth - rect.right}px`;
    } else {
      this.menu.style.left = `${rect.left}px`;
    }

    document.body.appendChild(this.overlay);
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    if (this.props.animated) {
      requestAnimationFrame(() => {
        this.menu.classList.remove('opacity-0', 'scale-95');
        this.menu.classList.add('opacity-100', 'scale-100');
      });
    }

    // Attach item clicks
    this.menu.querySelectorAll('button[data-value]').forEach((btn, i) => {
      const item = this.props.items.filter(it => !it.divider)[i];
      if (item?.onClick) {
        btn.addEventListener('click', () => {
          item.onClick!();
          this.hide();
        });
      }
    });
  }

  hide(): void {
    if (this.props.animated) {
      this.menu.classList.remove('opacity-100', 'scale-100');
      this.menu.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        this.overlay.remove();
      }, 200);
    } else {
      this.overlay.remove();
    }
  }
}

// =============================================================================
// TOOLTIP COMPONENT
// =============================================================================
export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export function createTooltip(element: HTMLElement, props: TooltipProps): void {
  const { content, position = 'top', delay = 300, maxWidth = 250 } = props;

  let tooltip: HTMLElement | null = null;
  let timeout: number = 0;

  const show = () => {
    timeout = window.setTimeout(() => {
      tooltip = document.createElement('div');
      tooltip.className = `
        absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
        transform transition-all duration-200 opacity-0 scale-95
      `;
      tooltip.style.maxWidth = `${maxWidth}px`;
      tooltip.textContent = content;

      const rect = element.getBoundingClientRect();
      document.body.appendChild(tooltip);

      const tooltipRect = tooltip.getBoundingClientRect();

      switch (position) {
        case 'top':
          tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
          tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
          break;
        case 'bottom':
          tooltip.style.top = `${rect.bottom + 8}px`;
          tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
          break;
        case 'left':
          tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
          tooltip.style.left = `${rect.left - tooltipRect.width - 8}px`;
          break;
        case 'right':
          tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
          tooltip.style.left = `${rect.right + 8}px`;
          break;
      }

      requestAnimationFrame(() => {
        tooltip?.classList.remove('opacity-0', 'scale-95');
        tooltip?.classList.add('opacity-100', 'scale-100');
      });
    }, delay);
  };

  const hide = () => {
    clearTimeout(timeout);
    if (tooltip) {
      tooltip.classList.remove('opacity-100', 'scale-100');
      tooltip.classList.add('opacity-0', 'scale-95');
      setTimeout(() => tooltip?.remove(), 200);
      tooltip = null;
    }
  };

  element.style.position = 'relative';
  element.addEventListener('mouseenter', show);
  element.addEventListener('mouseleave', hide);
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  Button,
  Input,
  Card,
  Modal,
  Toast,
  Tabs,
  createBadge,
  createSkeleton,
  Dropdown,
  createTooltip,
};