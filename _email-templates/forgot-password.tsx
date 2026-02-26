import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

type ForgotPasswordProps = {
  name: string
  hash: string
}

export function ForgotPassword({ name, hash }: ForgotPasswordProps) {
  return (
    <Html lang="pt-BR">
      <Head>
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLDz8Z11lFc-K.woff2',
            format: 'woff2',
          }}
        />
      </Head>
      <Preview>Esqueci minha senha</Preview>
      <Tailwind>
        <Body className="bg-orange-500 py-20 h-fit flex items-center justify-center">
          <Container className="bg-white rounded-lg px-10 py-8 flex flex-col">
            <Img
              src={`https://res.cloudinary.com/mikedevanorak/image/upload/v1760763194/chamado/logo-tech-support_etsgko.png`}
              width="202"
              height="40"
              alt="Logo TechSupport"
              className="m-auto"
            />

            <Section className="mt-8 text-center">
              <Text className="text-lg font-semibold text-zinc-500 leading-4">
                Olá, {name}!
              </Text>

              <Text className="text-base text-zinc-500 leading-6 mt-4">
                Clique no botão abaixo se você solicitou uma redefinição de
                senha. A solicitação tem 30 minutos de disponibilidade. Se você
                não fez essa solicitação, ignore este e-mail.
              </Text>

              <Button
                className="bg-orange-500 text-white px-8 py-3 rounded-md mb-4 mt-4"
                href={`${process.env.NEXT_PUBLIC_APP_URL}/trocar-senha?code=${hash}`}
              >
                Redefinir Senha
              </Button>

              <Text className="text-base text-zinc-500 leading-6 mt-4">
                Caso não consiga clicar no botão acima, copie o link abaixo e
                cole em seu navegador.
                <br />
                <span className="text-orange-500">{`${process.env.NEXT_PUBLIC_APP_URL}/trocar-senha?code=${hash}`}</span>
              </Text>

              <Hr />

              <Text className="text-xs text-zinc-500 mt-6">
                TechSupport - Sistema de Chamado
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
