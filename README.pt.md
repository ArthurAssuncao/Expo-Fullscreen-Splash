# expo-fullscreen-splash

Um componente React Native para criar telas de splash em tela cheia com animações suaves e controle preciso para aplicações Expo.

[![npm version](https://img.shields.io/npm/v/expo-fullscreen-splash.svg)](https://www.npmjs.com/package/expo-fullscreen-splash)
[![license](https://img.shields.io/npm/l/expo-fullscreen-splash.svg)](https://github.com/yourusername/expo-fullscreen-splash/blob/main/LICENSE)

## Por que este pacote?

Recentemente, o Expo migrou para a API SplashScreen introduzida no Android 12, conforme mencionado no changelog:

> "Migramos para a API SplashScreen introduzida no Android 12, o que resolve alguns problemas persistentes no Android 12+, e ajuda a evitar saltos de layout ao fazer a transição da tela de splash. As telas de splash para Android não podem ser em tela cheia com esta API (e isso também não funcionava particularmente bem antes), então talvez seja necessário atualizar sua tela de splash. Saiba mais na documentação do Android Splash screen e na documentação do expo-splash-screen."

Esta migração resultou em [problemas significativos para usuários do Expo](https://github.com/expo/expo/issues/32515), especialmente para aqueles que precisam de uma experiência de splash screen em tela cheia consistente em todas as plataformas.

O `expo-fullscreen-splash` foi criado especificamente para resolver esse problema, permitindo que desenvolvedores criem telas de splash em tela cheia customizáveis que funcionam perfeitamente em todas as versões do Android (incluindo Android 12+) e iOS, independentemente das limitações da API nativa do Android.

## Características

- ✨ Tela de splash em tela cheia com controle manual ou automático
- 🎭 Múltiplas animações de transição (fade, scale, slide, bounce)
- 🎨 Personalização completa de cores e estilos
- 📱 Integração com o sistema de áreas seguras do dispositivo
- 🔄 Gerenciamento automático da barra de navegação
- 🔌 API simples com referência para controle externo
- 🛠️ Solução para as limitações de splash screen em tela cheia do Android 12+

## Instalação

```bash
npm install expo-fullscreen-splash
# ou
yarn add expo-fullscreen-splash
```

## Dependências

Este pacote depende de:

- `react-native-reanimated`
- `react-native-safe-area-context`
- `expo-navigation-bar`

Certifique-se de que essas dependências estejam instaladas em seu projeto.

## Uso Básico

```jsx
import React, { useRef } from "react";
import { View, Text, Image } from "react-native";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);

  // Componente de Splash personalizado
  const MySplashComponent = () => (
    <View style={{ alignItems: "center" }}>
      <Image
        source={require("./assets/logo.png")}
        style={{ width: 200, height: 200 }}
      />
      <Text style={{ marginTop: 20, fontSize: 24 }}>Meu Aplicativo</Text>
    </View>
  );

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<MySplashComponent />}
      backgroundColor="#ffffff"
      animationType="fade"
      autoHide={true}
      splashDuration={3000}
      onAnimationEnd={() => console.log("Splash screen terminada")}
    >
      {/* Seu conteúdo de aplicativo vem aqui */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Conteúdo Principal do App</Text>
      </View>
    </ExpoFullscreenSplash>
  );
};

export default App;
```

## Controle Manual

Para controlar manualmente quando a tela de splash deve desaparecer:

```jsx
import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);

  useEffect(() => {
    // Simulando carregamento de dados ou inicialização
    async function prepareApp() {
      await fetchInitialData();
      // Esconde a tela de splash após a inicialização
      splashRef.current?.hide();
    }

    prepareApp();
  }, []);

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<YourSplashComponent />}
      backgroundColor="#f5f5f5"
      animationType="scale"
      autoHide={false} // Desativa o escondimento automático
    >
      <MainApp />
    </ExpoFullscreenSplash>
  );
};
```

## Integração com Carregamento de recursos

Muitos aplicativos Expo precisam carregar recursos e fontes personalizadas antes de exibir o conteúdo principal. O componente `ExpoFullscreenSplash` é perfeito para este caso de uso:

```jsx
import React, { useRef, useEffect } from "react";
import { StatusBar } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

// Seu componente de Splash
const SplashScreenComponent = () => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <Image
      source={require("../assets/logo.png")}
      style={{ width: 200, height: 200 }}
    />
    <Text style={{ color: "white", fontSize: 24, marginTop: 20 }}>
      Meu App Incrível
    </Text>
  </View>
);

export default function RootLayout() {
  // Carregando fontes
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const splashRef = useRef<SplashScreenRef>(null);

  // Fechar a splash screen quando as fontes forem carregadas
  useEffect(() => {
    if (loaded) {
      // Pequeno atraso para garantir que tudo esteja pronto
      const timer = setTimeout(() => {
        splashRef.current?.hide(() => {
          console.log("Splash screen was closed");
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<SplashScreenComponent />}
      backgroundColor="#c54cdf"
      animationType="fade"
      autoHide={false}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="light" animated={true} />
    </ExpoFullscreenSplash>
  );
}
```

Este exemplo mostra como integrar o componente `ExpoFullscreenSplash` com:

- Carregamento de fontes personalizadas usando `expo-font`
- Navegação com `expo-router`
- StatusBar personalizada
- Callback para confirmação quando a splash é fechada

A splash screen permanece visível até que as fontes sejam carregadas, proporcionando uma experiência de usuário contínua sem telas em branco ou mudanças bruscas durante o carregamento inicial.

## API

### Props

| Prop              | Tipo                 | Padrão        | Descrição                                                                                             |
| ----------------- | -------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `SplashComponent` | ReactNode            | _Obrigatório_ | Componente React a ser renderizado como splash                                                        |
| `backgroundColor` | string               | `"#ffffff"`   | Cor de fundo da tela de splash                                                                        |
| `splashDuration`  | number \| null       | `null`        | Duração (ms) da exibição da splash (quando `autoHide` é `true`). Quando `null`, exige controle manual |
| `animationType`   | string               | `"none"`      | Tipo de animação de saída (`"fade"`, `"scale"`, `"slide"`, `"bounce"`, `"none"`)                      |
| `onAnimationEnd`  | function             | `() => {}`    | Callback executado quando a animação termina                                                          |
| `containerStyle`  | StyleProp<ViewStyle> | `undefined`   | Estilos adicionais para o container da splash                                                         |
| `autoHide`        | boolean              | `false`       | Se `true`, esconde automaticamente após `splashDuration`                                              |
| `children`        | ReactNode            | _Obrigatório_ | Conteúdo principal do aplicativo a ser exibido após a splash                                          |

### Métodos

O componente expõe os seguintes métodos via ref:

| Método | Parâmetros                        | Descrição                                                           |
| ------ | --------------------------------- | ------------------------------------------------------------------- |
| `hide` | `(callback?: () => void) => void` | Esconde a tela de splash e executa o callback opcional ao finalizar |

## Exemplos

### Splash com Carregamento Personalizado

```jsx
const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.1;
        if (newProgress >= 1) {
          clearInterval(interval);
          splashRef.current?.hide();
          return 1;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const LoadingSplash = () => (
    <View style={{ alignItems: "center" }}>
      <Image source={require("./assets/logo.png")} />
      <Text>Carregando: {Math.round(progress * 100)}%</Text>
      {/* Sua barra de progresso personalizada */}
    </View>
  );

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<LoadingSplash />}
      animationType="fade"
      autoHide={false}
    >
      <MainApp />
    </ExpoFullscreenSplash>
  );
};
```

### Diferentes Tipos de Animação

```jsx
// Fade
<ExpoFullscreenSplash
  animationType="fade"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Scale
<ExpoFullscreenSplash
  animationType="scale"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Slide
<ExpoFullscreenSplash
  animationType="slide"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Bounce
<ExpoFullscreenSplash
  animationType="bounce"
  splashDuration={2000}
  autoHide={true}
  // ...
/>
```

## Gerenciamento da Barra de Navegação

O componente gerencia automaticamente a visibilidade e a cor da barra de navegação, restaurando as configurações originais quando a tela de splash é fechada.

## Considerações de Desempenho

- Use componentes leves em sua tela de splash para garantir carregamento rápido
- Para testes de animação, use o modo de desenvolvimento
- Para melhor desempenho em produção, considere usar `animationType="none"` se a transição suave não for essencial

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir um issue ou enviar um pull request.

## Licença

MIT
