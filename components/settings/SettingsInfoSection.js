import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './SettingsInfoSection.module.css';

const repositoryUrl = 'https://github.com/IceCream0910/kw-klas-plus';

const openGitHubLink = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        !KlasNativeBridge.isAvailable('openExternalLink')) return;
    event.preventDefault();
    const url = event.currentTarget.href;
    Promise.resolve().then(() => KlasNativeBridge.openExternalLink(url))
        .catch(() => toast.error('링크를 열지 못했어요. 다시 눌러주세요.'));
};

const copyToClipboard = (title, value) => {
    if (!value || value === 'loading...' || value === 'error') return;
    navigator.clipboard.writeText(value).then(() => {
        toast(`${title} 값을 복사했어요.`, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        toast('복사에 실패했습니다.');
    });
};

const SettingsInfoSection = ({ appVersion = 'n/a' }) => {
    const [contributors, setContributors] = useState([]);
    const [cfRay, setCfRay] = useState('loading...');
    const [cfPlacement, setCfPlacement] = useState('loading...');
    const [rybbitUid, setRybbitUid] = useState(() => {
        if (typeof window !== 'undefined') {
            const uid = localStorage.getItem('rybbit-user-id');
            return uid ? uid.substring(0, 16) + '...' : 'n/a';
        }
        return 'loading...';
    });

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const timeout = setTimeout(() => controller.abort(), 15000);

        const loadContributors = async () => {
            const response = await fetch(
                'https://api.github.com/repos/IceCream0910/kw-klas-plus/contributors?per_page=5',
                { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } }
            );
            if (!response.ok) throw new Error('Contributors request failed');
            const people = response.status === 204 ? [] : await response.json();
            if (!Array.isArray(people)) throw new Error('Invalid contributors response');
            if (active) setContributors(people.filter(person =>
                typeof person.login === 'string' && Number.isInteger(person.id)
            ).slice(0, 5));
        };
        loadContributors().catch(() => {
            if (active) setContributors([]);
        }).finally(() => clearTimeout(timeout));
        return () => {
            active = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (contributors.length < 2) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const interval = setInterval(() => {
            if (document.hidden || reducedMotion.matches) return;
            setContributors(people => [...people.slice(1), people[0]]);
        }, 5000);
        return () => clearInterval(interval);
    }, [contributors.length]);

    useEffect(() => {
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const ray = response.headers.get('cf-ray') || 'n/a';
                const placement = response.headers.get('cf-placement') || 'n/a';
                setCfRay(ray);
                setCfPlacement(placement);
            })
            .catch(() => {
                setCfRay('error');
                setCfPlacement('error');
            });
    }, []);

    return (
        <>
            <a className={styles.contributorsLink} href={repositoryUrl}
                target="_blank" rel="noopener noreferrer" onClick={openGitHubLink}
                aria-label="만든 사람들 · GitHub 저장소 열기">
                <span className={styles.label}>만든 사람들</span>
                <span className={styles.people} aria-hidden="true">
                    {contributors.length > 0 && (
                        <span className={styles.identity} key={contributors[0].id}>
                            <span className={styles.username} title={`@${contributors[0].login}`}>
                                @{contributors[0].login}
                            </span>
                            <span className={styles.role}>
                                {contributors[0].login.toLowerCase() === 'icecream0910' ? 'Maintainer' : 'Contributor'}
                            </span>
                        </span>
                    )}
                    <span className={styles.avatars}
                        style={contributors.length > 0 ? { width: 32 + (contributors.length - 1) * 22 } : undefined}>
                    {contributors.map((person, index) => (
                        <span className={styles.avatar} key={person.id} title={person.login}
                            style={{ zIndex: contributors.length - index, transform: `translateX(${index * 22}px)` }}>
                            <span>{person.login.slice(0, 2)}</span>
                            <img src={`https://avatars.githubusercontent.com/u/${person.id}?s=64`} alt=""
                                width="28" height="28" loading="lazy" referrerPolicy="no-referrer"
                                onError={event => { event.currentTarget.style.display = 'none'; }} />
                        </span>
                    ))}
                    {contributors.length === 0 && <span className={styles.fallback}>GitHub</span>}
                    </span>
                </span>
            </a>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('앱 버전', appVersion)}
            >
                <span style={{ fontSize: '16px' }}>앱 버전</span>
                <div>
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            KlasNativeBridge.openExternalLink('https://klasplus.yuntae.in');
                        }}
                        style={{
                            opacity: .8,
                            fontSize: '12px',
                            backgroundColor: 'var(--button-background)',
                            width: 'fit-content',
                            height: '24px',
                            padding: '4px 8px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '15px',
                        }}
                    >
                        업데이트 확인
                    </span>
                    <span style={{ opacity: .8, fontSize: '14px' }}>&nbsp;v{appVersion}</span>
                </div>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('Ray ID', cfRay)}
            >
                <span style={{ fontSize: '16px' }}>Ray ID</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfRay}</span>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('Region', cfPlacement)}
            >
                <span style={{ fontSize: '16px' }}>Region</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfPlacement}</span>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => {
                    const uid = localStorage.getItem('rybbit-user-id');
                    copyToClipboard('UID', uid || 'n/a');
                }}
            >
                <span style={{ fontSize: '16px' }}>UID</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{rybbitUid}</span>
            </button>
        </>
    );
};

export default SettingsInfoSection;
