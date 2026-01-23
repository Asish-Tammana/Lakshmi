import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface StatCardProps {
    title: string;
    value: string;
    color?: string;
    style?: ViewStyle;
}

const StatCard = ({ title, value, color, style }: StatCardProps) => {
    const theme = useTheme();

    return (
        <Card style={[styles.card, style]}>
            <Card.Content>
                <Text variant="titleSmall" style={{ color: theme.colors.outline }}>
                    {title}
                </Text>
                <Text variant="headlineMedium" style={{ color: color || theme.colors.primary, fontWeight: 'bold' }}>
                    {value}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 8,
        borderRadius: 12,
    },
});

export default StatCard;
