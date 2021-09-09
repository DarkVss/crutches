import { Dimensions, StyleSheet, View } from "react-native";
import { Image, Text } from "react-native-elements";
import React, { Component } from "react";

export default class Loader extends Component {
    static config = {
        backgroundColor : "#ff0000",
        fontColor       : "#ffffff",
        image           : require("./spinner.gif"),
        size            : {
            width  : Dimensions.get('window').width * 0.5,
            height : Dimensions.get('window').width * 0.5,
        },
        text            : "Wait please...",
    };

    constructor(props) {
        super(props);

        this.styles = StyleSheet.create({
            container : {
                width           : Dimensions.get('window').width,
                height          : Dimensions.get('window').height,
                alignItems      : "center",
                justifyContent  : "center",
                backgroundColor : Loader.config.backgroundColor,
            },
            image     : {
                width  : Loader.config.size.width,
                height : Loader.config.size.height,
            },
            text      : {
                color    : Loader.config.fontColor,
                fontSize : 15,
            },
        });
    }

    render() {
        return (
            this.props.isShow !== true ? null :
                <View style={this.styles.container}>
                    <Image source={Loader.config.image} style={this.styles.image}/>
                    <Text style={this.styles.text}>{Loader.config.text}</Text>
                </View>
        );
    }
}

/**
 * Usage: 
 *
 * render() {
 *     return (
 *         <View style={{ marginTop : getStatusBarHeight() }}>
 *             <Loader id="loader" isShow={this.state.showLoader}/>
 * 
 *             <ScrollView>
 *                 <View style={styles.container}>
 *                     <Text style={styles.textStyle}>Hello dear user! ^^</Text>
 *                     <Button title="Get data" onPress={this.click}/>
 *                     <View style={[styles.textStyle, styles.serverData]}>
 *                         <Text style={[styles.textStyle, styles.serverTitle]}>Server Answer</Text>
 *                         <Text style={[styles.textStyle, styles.serverAnswer]}>{this.state.serverAnswer}</Text>
 *                     </View>
 *                     <StatusBar style="auto"/>
 *                 </View>
 *             </ScrollView>
 *         </View>
 *     )
 * };
 */
