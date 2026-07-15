import { useEffect, useMemo, useState } from 'react';

export type PublicLanguage = 'en' | 'vi';

export const PUBLIC_LANGUAGE_STORAGE_KEY = 'moonlightLanguage';

export function resolvePublicLanguage(value: unknown): PublicLanguage {
  return value === 'vi' || value === 'en' ? value : 'en';
}

export function readStoredPublicLanguage(storage: Pick<Storage, 'getItem'> | undefined = window.localStorage) {
  if (!storage) {
    return 'en';
  }

  return resolvePublicLanguage(storage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY));
}

export function writeStoredPublicLanguage(language: PublicLanguage, storage: Pick<Storage, 'setItem'> = window.localStorage) {
  storage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, language);
}

export const publicCopy = {
  en: {
    nav: ['About', 'Services', 'Projects', 'Contact'],
    languageLabel: 'Language',
    hero: {
      eyebrow: 'Premium Post-Production',
      headline: 'Striving to make the intangible a reality.',
      body: 'Through quality storytelling and striking visuals, we deliver high-end cinematic solutions for global brands and film productions.',
      contact: 'Contact',
      openNavigation: 'Open navigation',
    },
    about: {
      eyebrow: 'Who We Are',
      headline: 'Bridging the gap between imagination and reality.',
      paragraphs: [
        'Founded in 2018 in Ho Chi Minh City, Moonlight Studio is a premium post-production partner. We specialize in high-quality storytelling, CGI, and VFX for TV commercials and digital films.',
        'By leveraging advanced expertise, we provide visual solutions for global corporations and agencies that require both technical excellence and creative innovation.',
      ],
    },
    marquee: {
      cmsTitle: 'Selected brands',
      fallbackTitle: 'Selected loops',
      cmsMeta: 'Partner archive',
      fallbackMeta: 'Motion archive',
      fallbackAlt: '3D motion study',
    },
    services: {
      eyebrow: 'Services',
      headline: 'Technical Excellence & Creative Design',
      items: [
        ['01', 'CGI', 'Creation of top-tier 3D visualizations, animations, and visual effects for media including images, films, and interactive applications.'],
        ['02', 'Color Grading', 'Expert color grading solutions to enhance the mood, consistency, and overall aesthetic of video content.'],
        ['03', 'VFX', 'Comprehensive visual effects services including compositing, layering, and the generation of particle effects or explosions.'],
        ['04', 'Post Production', 'Specialized technical services including tracking, matchmoving, rotoscoping, and matte painting to integrate virtual elements with live-action footage.'],
        ['05', 'Graphics', '2D and 3D graphics and motion graphics services, including everything from typefaces to creating captivating animated sequences.'],
        ['06', 'Production Support', 'Support for animatics during production house pitching and animation demos for the pre-production phase.'],
      ] as Array<[string, string, string]>,
    },
    projects: {
      eyebrow: 'Projects',
      headline: 'Sticky selected works',
      body: 'Stacked case cards designed to feel like a compact gallery of finished worlds.',
      projectLabel: 'Project',
      seeMore: 'See more',
      seeLess: 'See less',
      loading: 'Loading projects',
      fallbackDescription: 'Selected production work presented as a focused case study.',
      vimeoFilm: 'Vimeo Film',
      fallbackItems: [
        {
          title: 'Chrome Bloom',
          type: 'Brand Film',
          image: 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?auto=format&fit=crop&w=1400&q=85',
        },
        {
          title: 'Liquid Signal',
          type: 'Interactive Launch',
          image: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=1400&q=85',
        },
        {
          title: 'Soft Machine',
          type: 'Product System',
          image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&w=1400&q=85',
        },
      ],
    },
    contact: {
      eyebrow: 'Contact',
      headline: 'Start a new brief',
      body: 'Send a production request, CGI concept, launch film, or post-production brief. The CMS stores your message for the team to follow up.',
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      namePlaceholder: 'Your name',
      companyPlaceholder: 'Brand / agency',
      emailPlaceholder: 'name@company.com',
      phonePlaceholder: '+84 ...',
      messagePlaceholder: 'Tell us about the project, timeline, deliverables, and references.',
      contactRequired: 'Leave an email or phone number so we can reply.',
      failed: 'Could not send this message.',
      sent: 'Message sent. We will follow up soon.',
      sending: 'Sending',
      submit: 'Send request',
    },
  },
  vi: {
    nav: ['Giới thiệu', 'Dịch vụ', 'Dự án', 'Liên hệ'],
    languageLabel: 'Ngôn ngữ',
    hero: {
      eyebrow: 'Hậu kỳ cao cấp',
      headline: 'Biến những điều vô hình thành hiện thực.',
      body: 'Bằng tư duy kể chuyện và hình ảnh giàu cảm xúc, chúng tôi mang đến giải pháp điện ảnh cao cấp cho thương hiệu và các dự án phim.',
      contact: 'Liên hệ',
      openNavigation: 'Mở điều hướng',
    },
    about: {
      eyebrow: 'Chúng tôi là ai',
      headline: 'Kết nối trí tưởng tượng với hiện thực.',
      paragraphs: [
        'Thành lập năm 2018 tại TP. Hồ Chí Minh, Moonlight Studio là đối tác hậu kỳ cao cấp, chuyên storytelling, CGI và VFX cho TVC và phim digital.',
        'Với chuyên môn kỹ thuật và tinh thần sáng tạo, chúng tôi tạo ra giải pháp hình ảnh cho các tập đoàn, agency và đội ngũ sản xuất cần chất lượng khác biệt.',
      ],
    },
    marquee: {
      cmsTitle: 'Thương hiệu tiêu biểu',
      fallbackTitle: 'Chuyển động chọn lọc',
      cmsMeta: 'Kho đối tác',
      fallbackMeta: 'Kho motion',
      fallbackAlt: 'Nghiên cứu chuyển động 3D',
    },
    services: {
      eyebrow: 'Dịch vụ',
      headline: 'Kỹ thuật chính xác & thiết kế sáng tạo',
      items: [
        ['01', 'CGI', 'Tạo hình 3D, animation và hiệu ứng hình ảnh chất lượng cao cho hình ảnh, phim và trải nghiệm tương tác.'],
        ['02', 'Color Grading', 'Xử lý màu chuyên sâu để tăng cảm xúc, độ nhất quán và thẩm mỹ tổng thể cho nội dung video.'],
        ['03', 'VFX', 'Giải pháp kỹ xảo bao gồm compositing, layering, particle effects và các hiệu ứng phức tạp.'],
        ['04', 'Post Production', 'Dịch vụ hậu kỳ kỹ thuật như tracking, matchmoving, rotoscoping và matte painting.'],
        ['05', 'Graphics', 'Thiết kế 2D/3D và motion graphics, từ hệ chữ đến các chuỗi animation giàu cuốn hút.'],
        ['06', 'Production Support', 'Hỗ trợ animatic, pitching và demo animation cho giai đoạn tiền kỳ.'],
      ] as Array<[string, string, string]>,
    },
    projects: {
      eyebrow: 'Dự án',
      headline: 'Các tác phẩm chọn lọc',
      body: 'Những case study được xếp lớp như một gallery cô đọng của các thế giới hình ảnh đã hoàn thiện.',
      projectLabel: 'Dự án',
      seeMore: 'Xem thêm',
      seeLess: 'Thu gọn',
      loading: 'Đang tải dự án',
      fallbackDescription: 'Tác phẩm chọn lọc được trình bày như một case study cô đọng.',
      vimeoFilm: 'Phim Vimeo',
      fallbackItems: [
        {
          title: 'Chrome Bloom',
          type: 'Brand Film',
          image: 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?auto=format&fit=crop&w=1400&q=85',
        },
        {
          title: 'Liquid Signal',
          type: 'Interactive Launch',
          image: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=1400&q=85',
        },
        {
          title: 'Soft Machine',
          type: 'Product System',
          image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&w=1400&q=85',
        },
      ],
    },
    contact: {
      eyebrow: 'Liên hệ',
      headline: 'Bắt đầu brief mới',
      body: 'Gửi yêu cầu sản xuất, concept CGI, launch film hoặc hậu kỳ. CMS sẽ lưu nội dung để đội ngũ MoonLight phản hồi.',
      name: 'Tên',
      company: 'Công ty',
      email: 'Email',
      phone: 'Số điện thoại',
      message: 'Nội dung',
      namePlaceholder: 'Tên của bạn',
      companyPlaceholder: 'Thương hiệu / agency',
      emailPlaceholder: 'ten@congty.com',
      phonePlaceholder: '+84 ...',
      messagePlaceholder: 'Chia sẻ về dự án, timeline, deliverables và reference.',
      contactRequired: 'Hãy để lại email hoặc số điện thoại để chúng tôi phản hồi.',
      failed: 'Chưa thể gửi tin nhắn này.',
      sent: 'Đã gửi tin nhắn. Chúng tôi sẽ phản hồi sớm.',
      sending: 'Đang gửi',
      submit: 'Gửi yêu cầu',
    },
  },
};

export type PublicCopy = (typeof publicCopy)[PublicLanguage];

export function usePublicLanguage() {
  const [language, setLanguageState] = useState<PublicLanguage>('en');

  useEffect(() => {
    setLanguageState(readStoredPublicLanguage());
  }, []);

  function setLanguage(nextLanguage: PublicLanguage) {
    setLanguageState(nextLanguage);
    writeStoredPublicLanguage(nextLanguage);
  }

  return useMemo(
    () => ({
      language,
      setLanguage,
      copy: publicCopy[language],
    }),
    [language],
  );
}
