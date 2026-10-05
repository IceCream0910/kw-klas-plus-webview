import LegalDocument, { LegalNote, LegalSection } from '../components/legal/LegalDocument';
import styles from '../styles/Legal.module.css';

const contents = [
  { id: 'purpose', title: '수집·이용 목적' },
  { id: 'data', title: '처리하는 정보' },
  { id: 'storage', title: '보관과 파기' },
  { id: 'sharing', title: '외부 서비스와 정보 전송' },
  { id: 'analytics', title: '서비스 이용 분석' },
  { id: 'security', title: '안전성 확보 조치' },
  { id: 'rights', title: '이용자의 권리' },
  { id: 'contact', title: '문의와 방침 변경' },
];

export default function PrivacyPolicy() {
  return <LegalDocument type="privacy" title="개인정보 처리방침"
    description="어떤 정보가 왜 필요한지, 어디에 보관되는지, 어떻게 삭제할 수 있는지 안내합니다."
    date="최초 시행일 2024년 3월 4일 · 최종 개정일 2026년 10월 5일" contents={contents}
    summary={[
      { title: '기능에 필요한 정보만', text: '로그인, 학생증, AI 등 이용하는 기능에 따라 처리하는 정보가 달라집니다.' },
      { title: 'AI 이용 시 외부 전송', text: '대화, 첨부파일과 답변에 필요한 학사 정보가 OpenAI로 전송됩니다.' },
      { title: '보관은 1년 이내', text: '서버의 AI 대화와 분석정보는 최대 1년 보관하며, 더 일찍 삭제될 수 있습니다.' },
      { title: '열람·삭제 요청 가능', text: '개인정보에 관한 요청은 hey@yuntae.in으로 보내주세요.' },
    ]}>
    <LegalSection id="purpose" number={1} title="개인정보의 수집 및 이용 목적">
      <p>KLAS+는 서비스 제공에 필요한 개인정보를 다음 목적으로 처리합니다.</p>
      <ul><li>KLAS 및 중앙도서관 인증 연동, 학사 정보 조회와 모바일 학생증 제공</li><li>KLAS AI의 질문 응답, 학사 정보 조회 및 이용자가 승인한 일정 처리</li><li>서비스 이용 관련 문의 응대와 불만 처리</li><li>서비스 이용 현황 분석, 오류 확인 및 기능 개선</li></ul>
    </LegalSection>
    <LegalSection id="data" number={2} title="처리하는 개인정보의 항목">
      <p>이용하는 기능에 따라 아래 정보가 처리됩니다. AI에 직접 입력하거나 첨부한 내용에도 개인정보가 포함될 수 있습니다.</p>
      <dl className={styles.dataList}>
        <div><dt>로그인·인증</dt><dd>학번, KLAS 비밀번호, 인증 쿠키 및 세션 정보<small>학교 인증과 로그인 상태 유지에 사용합니다.</small></dd></div>
        <div><dt>모바일 학생증</dt><dd>학번, 중앙도서관 비밀번호, 전화번호<small>중앙도서관 인증 및 학생증 기능에 사용합니다.</small></dd></div>
        <div><dt>KLAS AI</dt><dd>대화 내용, 첨부파일, 수강 과목, 과제·출석·일정 등 질문 처리에 필요한 학사 정보, 대화 및 사용자 식별값<small>질문 응답과 대화 기록 제공에 사용합니다.</small></dd></div>
        <div><dt>서비스 이용·접속</dt><dd>방문·클릭 등 사용기록, 기기·운영체제·브라우저 정보, IP 주소 및 접속 환경, 분석용 식별값<small>서비스 운영과 이용 현황 분석에 사용합니다. 학번은 서버에서 해시값으로 변환해 분석 식별에 사용하며, 해시값도 보호 대상 정보로 취급합니다.</small></dd></div>
        <div><dt>문의</dt><dd>이메일 주소 및 문의 내용에 이용자가 포함한 정보<small>문의에 답변하고 요청을 처리하는 데 사용합니다.</small></dd></div>
      </dl>
      <LegalNote title="AI에 보내기 전에 확인해주세요"><p>질문에 필요하지 않은 비밀번호, 주민등록번호, 다른 사람의 개인정보는 입력하거나 첨부하지 마세요.</p></LegalNote>
    </LegalSection>
    <LegalSection id="storage" number={3} title="개인정보의 보유 및 파기">
      <p>로그인 상태와 일부 서비스 설정·캐시는 이용자의 기기에 저장됩니다. AI 대화 기록은 대화 목록과 이어서 대화하기 기능을 위해 Cloudflare 기반 서버에도 저장됩니다. 모든 정보가 기기에만 저장되는 것은 아닙니다.</p>
      <ul><li>AI 대화 기록 및 서비스 분석정보의 보유·이용기간은 최대 1년입니다. 목적 달성, 이용자의 삭제 요청 또는 자동 만료에 따라 그 전에 삭제될 수 있습니다.</li><li>현재 AI 서버의 대화 저장소에는 활동에 따라 갱신되는 30일 자동 만료가 적용됩니다. 오래 사용하지 않은 대화는 1년보다 먼저 삭제될 수 있습니다.</li><li>기기에 저장된 정보는 앱의 로그아웃·데이터 삭제 기능 또는 운영체제의 앱 데이터 삭제를 통해 정리할 수 있습니다. 기기 정보 삭제와 서버 정보 삭제는 별도로 처리됩니다.</li><li>문의 내용은 요청 처리 목적을 달성한 후 지체 없이 파기합니다. 관계 법령에 따라 보관해야 하는 경우에는 해당 법령의 기간과 목적에 한해 보관합니다.</li></ul>
      <p>보유기간이 끝나거나 처리 목적이 달성된 개인정보는 복구·재생할 수 없도록 삭제합니다. OpenAI에서 처리하는 정보의 보관·삭제는 해당 업체의 처리 정책과 서비스 설정도 적용됩니다.</p>
      <LegalNote title="대화 삭제와 앱 삭제는 달라요"><p>AI 대화 목록에서 대화를 삭제하면 KLAS+ 서버의 해당 대화 기록과 목록에서 제거됩니다. 앱을 삭제하는 것만으로 외부 서비스에 전송된 정보까지 삭제되는 것은 아닙니다. 추가 삭제 요청은 문의처로 보내주세요.</p></LegalNote>
    </LegalSection>
    <LegalSection id="sharing" number={4} title="외부 서비스 이용 및 정보 전송">
      <p>KLAS+는 기능 제공을 위해 다음 서비스와 정보를 주고받습니다. 학교 인증, 서버 호스팅, AI 처리는 각각 목적과 전달 정보가 다릅니다.</p>
      <dl className={styles.dataList}>
        <div><dt>학교 인증 서버</dt><dd>KLAS 및 중앙도서관 인증을 위해 학번, 비밀번호 등 인증에 필요한 정보를 학교의 공식 서버로 전송합니다.</dd></div>
        <div><dt>Cloudflare Workers</dt><dd>웹 서비스 및 AI 서버 호스팅에 사용합니다. 서비스 요청·응답, 접속 정보 및 AI 대화 기록이 서버 운영 과정에서 처리됩니다.</dd></div>
        <div><dt>OpenAI</dt><dd>AI 답변 생성을 위해 대화, 첨부파일 및 필요한 학사 정보·도구 실행 결과를 API로 전송합니다. AI 대화 제목 생성에도 대화 내용이 사용됩니다.</dd></div>
      </dl>
      <LegalNote title="AI 질문 한 번의 정보 흐름">
        <div className={styles.flow} aria-label="이용자 기기에서 KLAS+ AI 서버를 거쳐 OpenAI로 전송"><span>이용자 기기</span><b aria-hidden="true">→</b><span>KLAS+ AI 서버</span><b aria-hidden="true">→</b><span>OpenAI</span></div>
        <p>필요한 학사 정보가 질문 처리 과정에 포함될 수 있습니다. 외부 처리 서비스의 상세 내용은 <a href="https://openai.com/policies/privacy-policy/">OpenAI 개인정보 정책</a>과 <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare 개인정보 정책</a>에서 확인할 수 있습니다.</p>
      </LegalNote>
      <p>OpenAI API 이용 과정에서 개인정보가 국외에서 처리될 수 있습니다. 정보 전송은 AI 요청 시 네트워크를 통해 이루어집니다. AI 기능을 이용하지 않으면 해당 기능을 위한 OpenAI 전송은 발생하지 않습니다. 국외 처리 및 삭제에 관한 문의는 제8조의 연락처로 요청할 수 있습니다.</p>
    </LegalSection>
    <LegalSection id="analytics" number={5} title="행태정보의 수집 및 이용">
      <p>서비스 이용 현황과 개선할 기능을 파악하기 위해 자체 호스팅하는 Rybbit으로 방문·클릭 등 사용기록, 기기·브라우저·접속 정보 및 분석용 식별값을 처리합니다. 보유·이용기간은 최대 1년입니다.</p>
      <p>KLAS+에서 자체 운영하는 서버 외 제3자에 데이터가 전송되지 않습니다. 사용자를 식별하기 위해 학번을 Hash하여 고유식별번호(UUID)를 생성하며, 고유식별번호를 이용해 학번을 역산하거나 추적할 수 없습니다.</p>
      <LegalNote title="분석정보는 무엇인가요?"><p>예를 들어 어떤 화면이 자주 열리는지, 어떤 버튼이 사용되는지에 관한 기록입니다. 페이지 DOM 접근을 통한 사용자 화면 상호작용이 기록되며, 개인정보 및 입력 텍스트는 블라인드 처리됩니다.</p></LegalNote>
    </LegalSection>
    <LegalSection id="security" number={6} title="개인정보의 안전성 확보 조치">
      <p>KLAS+는 개인정보를 안전하게 처리하기 위해 암호화된 통신구간(HTTPS/TLS)을 사용하고, 인증정보와 대화 기록에 대한 접근을 제한합니다. 서비스 운영에 필요한 범위에서만 개인정보에 접근하며, 처리 목적이 끝난 정보는 삭제합니다.</p>
    </LegalSection>
    <LegalSection id="rights" number={7} title="이용자의 권리 및 행사 방법">
      <p>이용자는 자신의 개인정보에 대한 열람, 정정·삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 요청은 아래 이메일로 보내주세요. 본인 확인 후 관계 법령에 따라 처리하고 결과를 안내합니다. 법령상 제한이 있으면 그 사유를 안내합니다.</p>
      <LegalNote title="이렇게 요청하면 더 빠르게 확인할 수 있어요"><p>이용한 기능, 요청할 사항, 문제가 발생한 시점을 알려주세요. 본인 확인을 위해 필요한 정보는 별도로 안내하며, 문의 이메일에 계정 비밀번호를 보내지 마세요.</p></LegalNote>
      <p>동의 철회 또는 처리정지로 인해 해당 정보가 필요한 기능의 이용이 제한될 수 있습니다.</p>
    </LegalSection>
    <LegalSection id="contact" number={8} title="개인정보 보호책임자 및 방침 변경">
      <p>개인정보 보호책임자: 윤태인<br />이메일: <a href="mailto:hey@yuntae.in">hey@yuntae.in</a></p>
      <p>개인정보 처리방침을 변경하는 경우 이 페이지와 서비스 공지를 통해 변경 내용을 안내합니다. 필요한 경우 변경된 처리 내용에 대해 별도의 동의를 받습니다.</p>
      <p>본 방침은 2024년 3월 4일부터 시행되었습니다. 개정일은 2025년 3월 26일, 2026년 10월 5일이며, 이번 개정 내용은 2026년 10월 5일부터 적용됩니다.</p>
    </LegalSection>
  </LegalDocument>;
}
